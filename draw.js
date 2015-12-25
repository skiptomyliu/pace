
var w = 1400;
var h = 500;
var h_e = 200;
var margin = 50;
var pace_margin = .10; //+-6 seconds on chart

// 4 buckets
var all_runs;       // all runs, this will never change
var focused_runs;   // saved bucket of runs that the user has selected, becomes all_runs
var sub_runs;       // used for calculations based on focused_runs
var selected_runs;  // runs selected by user, short lived on each shift+click
var bubble_data;    


var draw_avg = false


/*  

Store all runs, 
then store a subset of the viewed runs for new scaled view

*/

// Core function that clusters runs into a bubble.  Days is the threshold for bubbling runs
// For example, if days = 2, any runs that fall within two days  
// of each other will be bubbled together
function bubble(runs, days) {
    var bubbles = []
    var br = new BubbledRuns()
    var ref_run = runs[0]
    var end_window_time = new Date(ref_run.run_time.getTime() - days * 86400000);

    runs.forEach(function(run){
        if (diff_days(ref_run.run_time, run.run_time) < days && ref_run != run) {
            br.addRun(run)
        } else {
            br = new BubbledRuns()
            br.addRun(run)
            bubbles.push(br)

            ref_run = run
            end_window_time = new Date(ref_run.run_time.getTime() - days * 86400000);
        }
    });
    return bubbles
}

var max_average_speed 
var min_average_speed
var start_end 
var max_distance_miles
var total_elevation_gain
var max_elevation_gain
var max_elevation_gain_f
var max_run_duration

var x_scale
var y_scale
// var total_elevation_gain
function update_ranges(run_data){
    max_average_speed = d3.max(run_data, function(el){
        return el.average_min_per_mi
    });

    min_average_speed = d3.min(run_data, function(el){
        return el.average_min_per_mi
    })

    start_end = d3.extent(run_data, function(el){ // get min and max start time
        return el.run_time
    });

    max_distance_miles = d3.max(run_data, function(el){
        return el.distance_miles
    })   

    total_elevation_gain = d3.sum(run_data, function(el){
        return parseFloat(el.total_elevation_gain)
    })

    max_elevation_gain = d3.max(run_data, function(el){
        return el.total_elevation_gain
    })

    max_run_duration = d3.max(run_data, function(el){
        return el.elapsed_time
    })
}

d3.json("content.json", 
    function(error, data) {
        // Get runs only
        var run_data = data.filter(function (data){
            return data.type == "Run" && data.average_speed > 2.2352 //12 min / mi;
        });

        // Add additional attributes to our run object
        data.forEach(function (el){
            el.run_time = new Date(el.start_date_local)
            el.average_min_per_mi = 26.8224/el.average_speed // Convert to min/mi
            el.distance_miles = el.distance * 0.000621371
        });

        update_ranges(run_data)
        max_elevation_gain_f = max_elevation_gain + 50
        x_scale = d3.time.scale().domain(start_end).range([margin,w-margin]);
        y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])
        y_scale_elevation = d3.scale.linear().domain([max_elevation_gain_f, 0]).range([0, h_e])

        all_runs = run_data
        focused_runs = all_runs
        sub_runs = all_runs

        canvas_viz()
        data_viz(all_runs)
    }
);

function data_viz(focused_runs) {
    // Remove runs that fall outside our view
    sub_runs = get_runs_window(focused_runs)
    update_ranges(sub_runs)
    // draw_weighted_avg(sub_runs)
    if (selectedRuns.size){
        update_axis()
    }
    bubble_data = bubble(sub_runs, calculate_bubble_thresh())
    draw_bubbles(bubble_data)

    update_display_averages()
    draw_elevation_chart(bubble_data)
}


function get_runs_window(all_runs){
    var window_time = new Date(x_scale.domain()[1].getTime()+1*86400000);
    sub_runs = all_runs.filter(function (all_runs){
        var start_time = new Date()
        return all_runs.run_time >= x_scale.domain()[0] && (all_runs.run_time) <= window_time
    });
    return sub_runs
}

// Pop the bubbles after less than 500 
function calculate_bubble_thresh(domain){
    var diff = diff_days(x_scale.domain()[0], x_scale.domain()[1])
    threshold = 3
    if (diff < 730)
        threshold = 2
    if (diff < 456)
        threshold = .0001
    
    return threshold
}

function translate_runs(d,i){
    return "translate("+x_scale(d.run_time)+","+y_scale(d.average_min_per_mi)+")"
}

function draw_bubbles(bubbles){ 
    var svg = d3.select("#runsG") // redo this variable
    var gcircles = svg.selectAll("circle").data(bubbles, function(d){return (d.run_time_end)});

    gcircles.enter()
        .append("circle")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", .75)
        .attr("transform", translate_runs)
        .attr('r', 0)
        .on("mouseover", highlight)
        .on("mouseout", unhighlight)

    gcircles
        .attr("transform", translate_runs)

    gcircles.transition().duration(500)
        .attr("r", function(d) { return radius_scale(d.distance_miles) })
        .style("fill", function(d) { return color_scale(d.distance_miles) })

    gcircles.exit()
        .transition().duration(500)
        .attr('r', 0)
        .remove(); 
}

// Move this somewhere appropriate


function translate_elevations(d,i){
    console.log(max_elevation_gain)
    return "translate("+x_scale(d.run_time)+","+(h-y_scale_elevation(max_elevation_gain_f-d.total_elevation_gain))+")"
}

function draw_elevation_chart(bubbles){
    var svg = d3.select("#elevationG")
    var grects = svg.selectAll("rect").data(bubbles)//, function(d){return (d.run_time_end)});
    
    grects.enter()
        .append("rect")
        .style("stroke-width", "1px")
        .style("fill", d3.rgb(122, 195,106))
        .style("opacity", .50)
        .attr('width',10)

    grects
        .attr("transform", translate_elevations)
        .attr("height", function(d) {return y_scale_elevation(max_elevation_gain_f-d.total_elevation_gain)})

    grects.exit()
        .transition().duration(500)
        .attr('width',0)
        .remove();
}

// Layout axis and canvas
function canvas_viz() {
    zoom = d3.behavior.zoom()
        .scaleExtent([1, Infinity])
        .x(x_scale)
        .on("zoomstart",    zoomstart)
        .on("zoom",         zooming)
        .on("zoomend",      zoomend)

    var canvas = d3.select("#vizcontainer")
        .append("svg")
            .attr("width", w+margin)
            .attr("height", h+margin)
            .call(zoom)
            .append("g")
            .attr("id", "canvas")

    /*

    Draw axis

    */
    color_scale  = d3.scale.linear().domain([0, max_distance_miles]).range(["white",d3.rgb(90, 155, 212)])
    radius_scale = d3.scale.linear().domain([0, max_distance_miles]).range([1,20])

    y_axis = d3.svg.axis().scale(y_scale).orient("left")
        .tickFormat(function(d){ return min_per_mi_str(d)} )
    var yaxisg = d3.select("svg g").append("g")
        .attr("id", "yAxisG")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin+",0)")
        .call(y_axis)

    x_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(10).tickSize(20,0)
    var xaxisg = d3.select("svg g").append("g")
        .attr("id", "xAxisG")
        .attr("class", "x axis")
        .attr("transform","translate(0,"+(h)+")")
        .call(x_axis)


    y_axis_elevation = d3.svg.axis().scale(y_scale_elevation).orient("right")
        .tickFormat(function(d){ return m_to_ft(d).toFixed(0)+" ft"})
        .ticks(10)
    var yaxiselevationg = d3.select("svg g").append("g")
        .attr("id", "yAxisElevationG")
        .attr("class", "y axis")
        .attr("transform", "translate("+(w-margin)+","+(h-h_e)+")")
        .call(y_axis_elevation)

    update_axis()

    /*
        Add run circle canvas
    */
    canvas.append("g")
        .attr("id", "runsG")

    canvas.append("g")
        .attr("id", "elevationG")

    var gpath = d3.select("svg g")
        .append("path")
        .attr("id", "weightedLine")
        // .attr("d", weightedLine(weighted_bins))
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2);
}

function update_axis(){

    console.log("updating the axis");
    y_axis.scale(y_scale)
    d3.select("#yAxisG").call(y_axis)

    x_scale = d3.time.scale().domain(start_end).range([margin,w-margin])
    x_axis.scale(x_scale)    
    d3.select("#xAxisG").call(x_axis)
    zoom.x(x_scale) // Have to set zoom.x again because we are overriding x_scale
}

function update_display_averages(){
    d3.select("#pace_fastest").text(min_per_mi_str(min_average_speed))
    d3.select("#pace_slowest").text(min_per_mi_str(max_average_speed))
    d3.select("#pace_farthest").text(max_distance_miles.toFixed(2))
    d3.select("#pace_total_elevation").text(m_to_ft(total_elevation_gain).toFixed(0)+" ft")
    d3.select("#pace_max_elevation").text(m_to_ft(max_elevation_gain).toFixed(0)+" ft")
    d3.select("#pace_duration").text(sec_to_hours(max_run_duration))
    // d3.select("#pace_slowest").text()
    // d3.select("#pace_slowest")
}

