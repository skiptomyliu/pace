
var w = 1400;
var h = 500;
var h_e = 200;
var margin = 50;
var pace_margin = .10; //+-6 seconds on chart

// 4 buckets
var all_runs = [];      // all runs, this will never change
var bubble_data = [];        
var TRANSITION_DURATION = 800

var max_average_speed = 0
var min_average_speed = 0
var average_speed = 0
var start_end = [0,200]
var max_distance_miles = 0
var total_elevation_gain = 0
var max_elevation_gain = 0 
var max_elevation_gain_f = 0
var max_run_duration = 0

var x_scale
var y_scale

function update_ranges(run_data){

    function SortBySpeed(a, b){
        return a.average_min_per_mi - b.average_min_per_mi
    }
    var run_data_copy = run_data.slice();
    fastest_run = run_data_copy.sort(SortBySpeed)[0]
    slowest_run = run_data_copy[run_data_copy.length-1]


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

    total_mileage = d3.sum(run_data, function(el){
       return el.distance_miles
    })

    max_elevation_gain = d3.max(run_data, function(el){
        return el.total_elevation_gain
    })

    max_elevation_gain_f = max_elevation_gain + 50;

    max_run_duration = d3.max(run_data, function(el){
        return el.elapsed_time
    })

    average_speed = 0
    distance = 0
    run_data.forEach(function (run) {
        average_speed = avg_pace(distance, average_speed, run.distance_miles, run.average_min_per_mi)
        distance+=run.distance_miles
    });
}


function calculate_monthly_mileage(runs){

}



function calculate_weekly_mileage(runs, year) {
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(),0,1);
        var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
        var dayOfYear = ((today - onejan +1)/86400000);
        return Math.ceil(dayOfYear/7)
    };

    function SortByDate(a, b){
      return b.run_time.getTime() - a.run_time.getTime()
    }
    // runs.sort(SortByDate);

    weekly_max_mileage = 0
    weekly_avg_mileage = 0
    var cur_mileage = 0
    var cur_week = -1
    var now_week = -1
    var count = 0
    runs.forEach(function (run) {
        var sd = new Date(); sd.setFullYear(year, 0, 1)
        var ed = new Date(); ed.setFullYear(year+1, 0, 1)

        if(run.run_time > sd  && run.run_time < ed){
            // console.log(run.run_time)
            if (cur_week != now_week) {
                weekly_avg_mileage = weekly_avg_mileage + (cur_mileage - weekly_avg_mileage)/count;
                now_week = cur_week
                cur_mileage = 0
                count = 0
            }
            cur_mileage += run.distance_miles

            if (cur_mileage > weekly_max_mileage){
                weekly_max_mileage = cur_mileage
            }
            cur_week = run.run_time.getWeek()
            count++;
        }
    }); 
}

function bucket_runs(runs) {
    runs_5k = runs.filter(function (data){
        return data.distance >= 4988 && data.distance <= 5150; // 3.1 to 3.2
    });

    runs_10k = runs.filter(function (data){
        return data.distance >= 9900 && data.distance <= 10150; // 6.1 to 6.3
    });

    runs_hm = runs.filter(function (data){
        return data.distance >= 20997.5 && data.distance <= 21404; // 13.04 to 13.
    });

    runs_mar = runs.filter(function (data){
        return data.distance >= 42003.88 && data.distance <= 43452.3; // 26.1 to 27
    });

    fastest_5k = d3.min(runs_5k, function(run){
        return run.average_min_per_mi
    })

    fastest_10k = d3.min(runs_10k, function(run){
        return run.average_min_per_mi
    })

    fastest_half = d3.min(runs_hm, function(run){
        return run.average_min_per_mi
    })

    fastest_full = d3.min(runs_mar, function(run){
        return run.average_min_per_mi
    })
}

canvas_viz();

queue()
    .defer(d3.json, "/activities")
    .await(handle_queue);

function handle_queue(error, data){
    draw_it(data)
}

function draw_it(data) {
    var run_data = data.filter(function (data){
        return data.type == "Run" && data.average_speed > 2.2352 //12 min / mi;
    });

    // Add additional attributes to our run object
    run_data.forEach(function (el){
        el.run_time = new Date(el.start_date)
        el.average_min_per_mi = 26.8224/el.average_speed // Convert to min/mi
        el.distance_miles = m_to_mi(el.distance)
        all_runs.push(el)
        var br = new BubbledRuns()
        br.addRun(el)
        bubble_data.push(br)
    });
    // all_runs = all_runs.concat(run_data)
    // all_runs.sort(compare);
    // bucket_runs(all_runs)
    update_ranges(all_runs)

    update(all_runs)
    data_viz(all_runs)
    draw_calendar(all_runs)
    draw_total_distance(all_runs)
}

function update(runs) {
    update_ranges(runs)
    bucket_runs(runs)
    calculate_weekly_mileage(runs, 2016)
    update_display_averages()
    update_scales()
    update_axis()
}

function data_viz(focused_runs) {
    var popped = BubbledRuns.pop(bubble_data, calculate_bubble_thresh())
    var new_bubbled = BubbledRuns.bubble(popped, calculate_bubble_thresh())
    bubble_data = BubbledRuns.combine(bubble_data, new_bubbled)
    bubble_data = BubbledRuns.bubble(bubble_data, calculate_bubble_thresh())
    draw_bubbles(bubble_data)
    draw_elevation_chart(bubble_data)
    update_display_averages()
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
function calculate_bubble_thresh(){
    var diff = diff_days(x_scale.domain()[0], x_scale.domain()[1])
    threshold = 7
    if (diff < 730)
        threshold = .0001

    return threshold
}

function translate_runs(d,i){
    return "translate("+x_scale(d.run_time)+","+y_scale(d.average_min_per_mi)+")"
}

function translate(bubble) {
     return "translate("+x_scale(bubble.run_time)+","+y_scale(bubble.average_min_per_mi)+")"
}

function draw_bubbles(bubbles){ 
    var svg = d3.select("#runsG") // redo this variable
    var gcircles = svg.selectAll("circle").data(bubbles, function(d){ return ( (d.run_time+d.run_time_end)) });

    gcircles.enter()
        .append("circle")
        .attr("id", function(d,i) { return d.id })
        .on("mouseover", highlight)
        .on("mouseout", unhighlight)
        .on("click", function(b,i) {
            var popped_bubbles = BubbledRuns.pop_index(bubble_data, i)
            bubble_data = bubble_data.concat(popped_bubbles)
            draw_bubbles(bubble_data)
        })
        .attr("transform", function(d) {    
            if (d.start_bub) {
                return translate(d.start_bub)
            } else {
                console.log("Transform")
            }
        })
        // .attr("transform", translate_runs)
        .attr("r", 0)
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", .75)
        
        
    gcircles.transition()
            .duration(TRANSITION_DURATION)
            .attr("r", function(d) { return radius_scale(d.distance_miles) })
            .attr("transform", translate_runs)
            .style("fill", function(d) { return color_scale(d.distance_miles) })

    gcircles.exit()
        .transition().duration(TRANSITION_DURATION)
            .attr("transform", function(d){
                if (d.end_bub) {
                    return translate(d.end_bub)
                } else {
                    console.log("stay diffuse")
                    return d3.select(this).attr("transform")
                }
            })
            .attr("r", 0)
        .each("end", destroy)

    function destroy() {
        d3.select(this).remove()
    }
}

// Begin Elevation
function translate_elevations(d,i){
    return "translate("+x_scale(d.run_time)+","+(h-y_scale_elevation(max_elevation_gain_f-d.total_elevation_gain))+")"
}


function draw_elevation_chart(bubbles){
    var svg = d3.select("#elevationG")
    var grects = svg.selectAll("rect").data(bubbles)//, function(d){return (d.run_time_end)});
    
    grects.enter()
        .append("rect")
        .attr("id", function(d,i) { return d.id })
        // .on("mouseover", highlight)
        // .on("mouseout", unhighlight)
        .style("stroke-width", "1px")
        .style("fill", d3.rgb(122, 195,106))
        .style("opacity", .50)
        .attr("class", "elevation_rect")
        .attr('width',10)

    grects
        .attr("transform", translate_elevations)
        .attr("height", function(d) { return y_scale_elevation(max_elevation_gain_f-d.total_elevation_gain) })

    grects.exit()
        .transition().duration(500)
        .attr('width',0)
        .remove();
}

// Layout axis and canvas
function canvas_viz() {
    x_scale = d3.time.scale().domain(start_end).range([margin,w-margin]);
    y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])
    y_scale_elevation = d3.scale.linear().domain([max_elevation_gain_f, 0]).range([0, h_e])
    zoom = d3.behavior.zoom()
        .scaleExtent([1, Infinity])
        .x(x_scale)
        .on("zoomstart",    zoomstart)
        .on("zoom",         zooming)
        .on("zoomend",      zoomend)

    var canvas = d3.select("#pace_container")
        .append("svg")
            .attr("width", w+margin)
            .attr("height", h+margin-20)
            .call(zoom)
            .append("g")
            .attr("id", "canvas")

    /*

    Draw axis

    */

    y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("left")
        // .ticks(5)
        .tickSize(-10000, 0, 0)
        .tickFormat(function(d){ return min_per_mi_str(d)} )
    var yaxisg = d3.select("svg g").append("g")

        .attr("id", "yAxisG")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin+",0)")
        .call(y_axis)

    x_axis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom")
        .ticks(10)
        .tickSize(20,0)

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

    // update_axis()

    /*
        Add run circle canvas
    */
    canvas.append("g")
        .attr("id", "runsG")

    canvas.append("g")
        .attr("id", "elevationG")
}

function update_scales(){
    color_scale  = d3.scale.linear().domain([0, max_distance_miles]).range(["white",d3.rgb(90, 155, 212)])
    radius_scale = d3.scale.linear().domain([0, max_distance_miles]).range([1,20])
}
function update_axis(){
    y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])
    console.log("updating the axis");
    y_axis.scale(y_scale)
    d3.select("#yAxisG").call(y_axis)

    x_scale = d3.time.scale().domain(start_end).range([margin,w-margin])
    x_axis.scale(x_scale)    
    d3.select("#xAxisG").call(x_axis)
    zoom.x(x_scale) // Have to set zoom.x again because we are overriding x_scale

    y_scale_elevation = d3.scale.linear().domain([max_elevation_gain_f, 0]).range([0, h_e])
    y_axis_elevation.scale(y_scale_elevation)
    d3.select("#yAxisElevationG").call(y_axis_elevation)
}

function update_display_averages() {
    d3.select("#pace_fastest").text(min_per_mi_str(fastest_run.average_min_per_mi))
    d3.select("#pace_slowest").text(min_per_mi_str(max_average_speed))
    d3.select("#pace_avg").text(min_per_mi_str(average_speed))
    d3.select("#pace_farthest").text(max_distance_miles.toFixed(2))
    d3.select("#pace_total_elevation").text(m_to_ft(total_elevation_gain).toFixed(0)+" ft")
    d3.select("#pace_max_elevation").text(m_to_ft(max_elevation_gain).toFixed(0)+" ft")
    d3.select("#pace_duration").text(sec_to_hours(max_run_duration))
    d3.select("#pace_pr_5k").text(min_per_mi_str(fastest_5k))
    d3.select("#pace_pr_10k").text(min_per_mi_str(fastest_10k))
    d3.select("#pace_pr_half").text(min_per_mi_str(fastest_half))
    d3.select("#pace_pr_full").text(min_per_mi_str(fastest_full))
    d3.select("#pace_pr_week").text(weekly_max_mileage.toFixed(2))
    d3.select("#pace_pr_week_avg").text(weekly_avg_mileage.toFixed(2))
    d3.select("#pace_total_mileage").text(total_mileage.toFixed(2))
    
    
    // d3.select("#pace_pr_monthly").text(min_per_mi_str(fastest_full))
    
}

