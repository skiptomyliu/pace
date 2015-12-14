
var w = 1400;
var h = 500;
var margin = 40;
var bubble_data;
var all_runs;
saved_scale = 1
bubble_bins = 4

/*

Store all runs, 
then store a subset of the viewed runs for new scaled view


*/
function BubbledRuns() {
    this.average_min_per_mi = 0
    this.distance_miles = 0
    this.run_time
    this.run_time_end
    this.runs = []
    this.bubble_id = "b"+Math.ceil(Math.random()*100000000)
    this.addRun = function(run) {
        if (!(this.runs.length)){
            this.run_time = run.run_time
            this.run_time_end = run.run_time
        } 
        // else {
        //     this.run_time = avg_date(this.run_time, run.run_time)
        // }
        // if (this.run_time >= run.run_time)
        //     this.run_time = run.run_time
        // if (this.run_time_end <= run.run_time_end)
        //     this.run_time_end = run.run_time_end

        this.average_min_per_mi = avg_pace(this.distance_miles, this.average_min_per_mi, 
            run.distance_miles, run.average_min_per_mi )
        this.distance_miles += run.distance_miles
        this.runs.push(run)
    }
}

function compare(a,b) {
  if (a.run_time < b.run_time)
    return 1;
  if (a.run_time > b.run_time)
    return -1;
  return 0;
}

function pop_bubbles(bubbles, days){
    runs = []
    popped_bubbles = []
    index=0;
    bubbles.forEach(function(bubbled_run) {
        if(bubbled_run.runs.length > 1) { 
            if(diff_days(bubbled_run.runs[0].run_time, bubbled_run.runs[1].run_time) > days){
                popped_bubbles.push(bubbled_run)
            }
        }
        index++;
    })
    popped_bubbles.forEach(function(bubble){
        runs = runs.concat(pop_bubble(bubble))
    })
    runs.sort(compare)
    return runs
}


/*
    1.  Loop through all bubbles
    2.  Set reference bubble as anchor for comparison.
    3.  Create a window frame as a bucket.
    4.  Don't fuse the anchor bubble unless the window frame hits another bubble
    4a.  Loop through subsequent bubbles, if bubble falls inside frame append its runs
    6b.  Add anchor bubble's runs if we have not done so.  
    7.  If current bubble falls outside of window, we set the new ref bubble as the anchor
    8.  Delete the bubbles that are to be fused
    9.  Return the runs
*/

function fuse_bubbles(bubbles, days){
    var fused_runs = []
    var popped_bubbles = []

    //XXX
    // Theres a double check on initial loop because we reference the first bubble here...
    //  So it's checking itself on the first run
    // consider having the loop start at index 2 to avoid double checking
    var ref_bubble = bubbles[0] // anchor
    var end_window_time = new Date(ref_bubble.run_time.getTime() - days * 86400000);
    // console.log("cur window " + ref_bubble.run_time + " - " + end_window_time)

    bubbles.forEach(function(bubble){
        // console.log(bubble)
        if (bubble.run_time < end_window_time){
            ref_bubble = bubble
            end_window_time = new Date(ref_bubble.run_time.getTime() - days * 86400000);
        }

        if (diff_days(ref_bubble.run_time, bubble.run_time) <= days && ref_bubble != bubble){           

            if (popped_bubbles.indexOf(ref_bubble) <= 0){
                popped_bubbles.push(ref_bubble)
            }
            if(popped_bubbles.indexOf(bubble)<=0){
                popped_bubbles.push(bubble)
            }
        }   
    });
    // popped_bubbles.sort(compare)

    popped_bubbles.forEach(function(bubble){
        fused_runs = fused_runs.concat(pop_bubble(bubble))
    })


    //XXX: Do we need to sort?

    fused_runs.sort(compare)

    return fused_runs
}

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

function pop_bubble(bubbled_run){
    var runs = []
    while(bubbled_run.runs.length) {
        run = bubbled_run.runs.pop()
        runs.push(run)
    }
    var index = bubble_data.indexOf(bubbled_run)
    if(index>=0)
        bubble_data.splice(index,1)
        d3.select("#runsG").selectAll("g").data(bubble_data).exit().remove()

    return runs
}

var max_average_speed 
var min_average_speed
var start_end 
var max_distance_miles
var x_scale
var y_scale

d3.json("content3.json", 
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

        x_scale = d3.time.scale().domain(start_end).range([margin,w-margin]);
        y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])

        all_runs = run_data.sort(compare)
        bubble_data = bubble(all_runs, .00001)
        bubble_data.sort(compare)
        data_viz(bubble_data)
        draw_bubbles(bubble_data)
        console.log("Starting runs: " + all_runs.length)
        console.log("starting: " + bubble_data.length)
    }
);

function calculate_bubble_thresh(){
    var days = diff_days(x_scale.domain()[0], x_scale.domain()[1])
    return days/500
}

function translate_runs(d,i){
    return "translate("+x_scale(d.run_time)+","+y_scale(d.average_min_per_mi)+")"
}

function draw_bubbles(bubbles){ 
    var svg = d3.select("#runsG")
    var gcircles = svg.selectAll("g").data(bubbles)
    gcircles.enter()
        .append("g")
        .attr("class", "circleg")
        .attr("id", function(d){return d.bubble_id})
        .attr("transform", translate_runs)
        .append("circle")
        .attr("r", function(d) { return radius_scale(d.distance_miles)})
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("fill", function(d) {return color_scale(d.distance_miles)})
        .on("mouseover", highlightRegion)
        .on("mouseout", function(){
            d3.select(this).classed("inactive",true)
            d3.select(d3.event.target).transition().duration(500)
            .style("fill", function(d){
                return color_scale(d.distance_miles)
            })})
    // gcircles.attr("transform", translate_runs)
    gcircles.exit().remove();
    

    function unhighlight(d){
        d.classed("active", false)
    }
    function highlightRegion(d) {
        d3.select(d3.event.target).classed("active",true)
            .style("fill", function(){return "red"})
            this.parentElement.appendChild(this);

        var coord = (d3.transform(d3.select(this).attr("transform"))).translate
        var x = coord[0]
        var y = coord[1]

        // Pop out the tooltip
        var tooltip = d3.select("#tooltip")

        d3.select("#tooltip #run_title")
            .text(d.name)

        d3.select("#tooltip a")
            .attr({"href": "https://strava.com/activities/"+d.id})
            
        var date_time = d.run_time;     //(d.run_time.getMonth()+1)+"/"+d.run_time.getDate() + "/" + d.run_time.getFullYear()
        var date_time_end = d.run_time; //(d.run_time_end.getMonth()+1)+"/"+d.run_time_end.getDate() + "/" + d.run_time_end.getFullYear()

        d3.select("#tooltip #run_date")
           .text(date_time)
        d3.select("#tooltip #run_date_end")
           .text(date_time_end)
           
        d3.select("#tooltip #run_distance")
           .text(parseFloat(d.distance_miles).toPrecision(4))
        d3.select("#tooltip #run_pace")
           .text(d.average_min_per_mi.toPrecision(4))
        d3.select("#tooltip").classed("hidden", false);

        var tooltipRect = tooltip.node().getBoundingClientRect()

        d3.select("#tooltip")
            .style("left", (x-tooltipRect.width/2.5+500) + "px")
            .style("top", y-tooltipRect.height+150 + "px")
    }

}


// Layout axis and canvas
function data_viz(incoming_data) {
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, Infinity])
        .x(x_scale)
        // .y(y_scale)
        .on("zoom", refresh)
        .on("zoomend", refresh2)

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

    function is_zooming_in(){
        zooming_in = (saved_scale < d3.event.scale)
        saved_scale = d3.event.scale
        return zooming_in
    }

    function refresh() {
        svg.select("#xAxisG").call(x_axis);
        svg.select("#yAxisG").call(y_axis);
        d3.selectAll("#runsG g")
            .attr("transform", translate_runs);

        is_zooming_in()
    }

    function refresh2(){
        var threshold = calculate_bubble_thresh()
        threshold = 5
        console.log(threshold)
        var runs 
        if(zooming_in) {
            // It seems that popping all back to 1 makes merging back okay... don't set to threshold
            runs = pop_bubbles(bubble_data, .00000001)
            if (runs.length) { 
                var bubble_data2 = bubble(runs, .00000001)

              
            }  
        } else {            
            runs = fuse_bubbles(bubble_data, threshold)
            if (runs.length){
                var bubble_data2 = bubble(runs, threshold)   
            }
        }
        
        bubble_data = bubble_data.concat(bubble_data2)
        bubble_data.sort(compare)
        draw_bubbles(bubble_data)
        console.log(bubble_data)
        console.log("bubble length: " + bubble_data.length)
    }


    // var points = 7
    // var weighted_bin = []
    // for(i=0; i<incoming_data.length; i+=points){
    //     var bin_pace = 0
    //     var bin_mileage = 0
    //     for (j=0; j < points; j++){
    //         if (i+j < incoming_data.length){
    //             current_run = incoming_data[i+j]
    //             bin_pace = avg_pace(bin_mileage, bin_pace, current_run.distance_miles, current_run.average_min_per_mi)
    //             bin_mileage += current_run.distance_miles
    //         }
    //     }
    //     weighted_bin.push(bin_pace)
    // }

    // var weighted_ramp = d3.scale.linear()
    //     .domain([0, weighted_bin.length])
    //     .range([margin,w-margin]);


    // var weightedLine = d3.svg.line()
    //     .x(function(d,i) {
    //         return weighted_ramp(i)
    //     })
    //     .y(function(d){
    //         return y_scale(d)
    //     })
    // d3.select("svg g")
    //     .append("path")
    //     .attr("id", "weightedLine")
    //     .attr("d", weightedLine(weighted_bin))
    //     .attr("fill", "none")
    //     .attr("stroke", "blue")
    //     .attr("stroke-width", 2);
}

