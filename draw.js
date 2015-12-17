
var w = 1400;
var h = 500;
var margin = 40;
var all_runs;
var sub_runs;

var draw_avg = false
/*  

Store all runs, 
then store a subset of the viewed runs for new scaled view

*/

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
var x_scale
var y_scale

function calculate_ranges(run_data){
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

        calculate_ranges(run_data)

        x_scale = d3.time.scale().domain(start_end).range([margin,w-margin]);
        y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])

        all_runs = run_data
        sub_runs = all_runs

        var bubble_data = bubble(all_runs, calculate_bubble_thresh())
        bubble_data.sort(compare)
        data_viz(bubble_data)
        draw_bubbles(bubble_data)

        console.log("Starting runs: " + all_runs.length)
        console.log("starting: " + bubble_data.length)
    }
);

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
    if (diff < 456){
        threshold = .0001
    } 
    return threshold
}

function translate_runs(d,i){
    return "translate("+x_scale(d.run_time)+","+y_scale(d.average_min_per_mi)+")"
}

function draw_bubbles(bubbles){ 
    var svg = d3.select("#runsG")
    var gcircles = svg.selectAll("circle").data(bubbles, function(d){return (d.run_time_end)});

    gcircles.enter()
        .append("circle")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("transform", translate_runs)
        .attr('r',0)
        .on("mouseover", highlightRegion)
        .on("mouseout", function(){
            d3.select(this).classed("inactive",true)
            d3.select(d3.event.target).transition().duration(500)
            .style("fill", function(d){
                return color_scale(d.distance_miles)
            })})

    gcircles
        .attr("transform", translate_runs)

    gcircles.transition().duration(500)
        .attr("r", function(d) { return radius_scale(d.distance_miles)})
        .style("fill", function(d) {return color_scale(d.distance_miles)})

    gcircles.exit()
        .transition().duration(500)
        .attr('r',0)
        .remove(); 
}

// Layout axis and canvas
function data_viz(incoming_data) {
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, Infinity])
        .x(x_scale)
        // .y(y_scale)
        .on("zoom", refresh)
        .on("zoomend", refresh_window)

    var svg = d3.select("#vizcontainer")
        .append("svg")
            .attr("width", w+margin)
            .attr("height", h+margin)
            .call(zoom)
            .append("g")
            .attr("id", "canvas")
    /*

    Draw axis

    */

    color_scale = d3.scale.linear().domain([0, max_distance_miles]).range(["white", "#990000"])
    radius_scale = d3.scale.linear().domain([0, max_distance_miles]).range([1,20])

    var y_axis = d3.svg.axis().scale(y_scale).orient("left")
    var yaxisg = d3.select("svg g").append("g")
        .attr("id", "yAxisG")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin+",0)")
        .call(y_axis)

    var x_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(10).tickSize(20,0)
    var xaxisg = d3.select("svg g").append("g")
        .attr("id", "xAxisG")
        .attr("class", "x axis")
        .attr("transform","translate(0,"+(h)+")")
        .call(x_axis)

    /*
        Add run circle canvas
    */
    svg.append("g")
        .attr("id", "runsG")


    function calculate_weight_bins(runs, bins){
        var points = bins
        var weighted_bin = []
        for(i=0; i<runs.length; i+=points){
            var bin_pace = 0
            var bin_mileage = 0
            for (j=0; j < points; j++){
                if (i+j < runs.length){
                    current_run = runs[i+j]
                    bin_pace = avg_pace(bin_mileage, bin_pace, current_run.distance_miles, current_run.average_min_per_mi)
                    bin_mileage += current_run.distance_miles
                }
            }
            weighted_bin.unshift(bin_pace)
        }

        return weighted_bin
    }


     var gpath = d3.select("svg g")
            .append("path")
            .attr("id", "weightedLine")
            // .attr("d", weightedLine(weighted_bins))
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2);

    function draw_weighted_avg(runs) {
        var weighted_bins = calculate_weight_bins(runs, 7)
        var weighted_ramp = d3.scale.linear()
            .domain([0, weighted_bins.length])
            .range([margin,w-margin]);

        var weightedLine = d3.svg.line()
            .x(function(d,i) {
                var percent = i/weighted_bins.length
                //index_date = (end_date) - (percent)*(end_date-start_date)
                var end_time = runs[runs.length-1].run_time.getTime()
                var start_time = runs[0].run_time.getTime()
                new_date = end_time - percent*(end_time-start_time)
                weight_date = new Date(new_date)

                return x_scale(weight_date) 
            })
            .y(function(d){
                return y_scale(d)
            })

        d3.select("#weightedLine")
            // .transition().duration(500)
            .attr("d", weightedLine(weighted_bins))
    }

    function is_zooming_in(){
        zooming_in = (saved_scale < d3.event.scale)
        saved_scale = d3.event.scale
        return zooming_in
    }

    function refresh() {
        var threshold = calculate_bubble_thresh()
        sub_runs = get_runs_window(all_runs)
        calculate_ranges(sub_runs)
        // draw_weighted_avg(sub_runs)
        svg.select("#xAxisG").call(x_axis);
        // svg.select("#yAxisG").call(y_axis);
        svg.selectAll("circle")
            .attr("transform", translate_runs)

    }

    function refresh_window(){
        var threshold = calculate_bubble_thresh()
        sub_runs = get_runs_window(all_runs)
        calculate_ranges(sub_runs)
        // y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])
        // var y_axis = d3.svg.axis().scale(y_scale).orient("left")
        // svg.select("#yAxisG").call(y_axis);
        if (draw_avg){
            draw_weighted_avg(sub_runs)
        }
        var bubble_data = bubble(sub_runs, threshold)
        draw_bubbles(bubble_data)
    }

}

