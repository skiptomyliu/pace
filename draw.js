

var w = 1400;
var h = 500;
var margin = 40;

d3.json("content.json", 
    function(error, data) {
        // Get runs only
        run_data = data.filter(function (data){
            return data.type == "Run" && data.average_speed > 2.2352 //12 min / mi;
        });
        // console.log(run_data)
        data_viz(run_data)
    }
);

// Draw data
function data_viz(incoming_data) {
    incoming_data.forEach(function (el){
        el.run_time = new Date(el.start_date_local)
        el.average_min_per_mi = 26.8224/el.average_speed // Convert to min/mi
        el.distance_miles = el.distance * 0.000621371
    });

    var max_average_speed = d3.max(incoming_data, function(el){
        return el.average_min_per_mi
    });

    var min_average_speed = d3.min(incoming_data, function(el){
        return el.average_min_per_mi
    })

    var start_end = d3.extent(incoming_data, function(el){
        return el.run_time
    });

    var max_distance_miles = d3.max(incoming_data, function(el){
        return el.distance_miles
    })

    var color_scale = d3.scale.linear().domain([0, max_distance_miles]).range(["white", "#990000"])
    var time_ramp = d3.time.scale()
        .domain(start_end)
        .range([margin,w-margin]);
    var x_scale = time_ramp,
        x = x_scale.copy()
    var y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])
        // y = y_scale.copy()
    var radius_scale = d3.scale.linear().domain([0, max_distance_miles]).range([1,20])
    
// var zoom = d3.behavior.zoom()
//     .scaleExtent([1, Infinity])
//     .on("zoom", zoomed);

// function zoomed() {
//   d3.select("#vizcontainer svg g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
// }

var zoom = d3.behavior.zoom()
    .scaleExtent([1, Infinity])
    .x(x_scale)
    .y(y_scale)
    .on("zoom", refresh);

var svg = d3.select("#vizcontainer")
    .append("svg")
        .attr("width", w)
        .attr("height", h+margin)
        .call(zoom)
        .append("g")

    /*
    
    Draw axis

    */
    var y_axis = d3.svg.axis().scale(y_scale).orient("left")
    var yaxisg = d3.select("svg g").append("g")
        .attr("id", "yAxisG")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin+",0)")
        .call(y_axis)

    yaxisg.selectAll("line").data(y_scale.ticks(64), function(d){return d;})
        .enter()
        .append("line")
        .attr("class", "minor")

    var x_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(10).tickSize(20,0)
    var xaxisg = d3.select("svg g").append("g")
        .attr("id", "xAxisG")
        .attr("class", "x axis")
        .attr("transform","translate(0,"+(h)+")")
        .call(x_axis)

    xaxisg.selectAll("line").data(x_scale.ticks(64), function(d) { return d; })
        .enter()
        .append("line")
        .attr("class", "minor")
        .attr("y1", 0)
        .attr("y2", 10)
        .attr("x1", x_scale)
        .attr("x2", x_scale)


    function refresh() {
      svg.select("#xAxisG").call(x_axis);
      svg.select("#yAxisG").call(y_axis);
    }

    svg    
        .append("g")
        .attr("id", "runsG")
        .selectAll("g")
        .data(incoming_data)
        .enter()
        .append("g")
        .attr("class", "overallG")
        .attr("transform", function(d,i) {
            return "translate("+time_ramp(d.run_time)+","+y_scale(d.average_min_per_mi)+")"
        })
        


    var runG = d3.selectAll("g.overallG")
    runG.append("circle")
        .attr("r", function(d) {return radius_scale(d.distance_miles)})
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("fill", function(d) {return color_scale(d.distance_miles)})

    runG.on("mouseover", highlightRegion);

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
            
        var date_time = (d.run_time.getMonth()+1)+"/"+d.run_time.getDate() + "/" + d.run_time.getFullYear()
        d3.select("#tooltip #run_date")
           .text(date_time)
        d3.select("#tooltip #run_distance")
           .text(parseFloat(d.distance_miles).toPrecision(3))
        d3.select("#tooltip #run_pace")
           .text(d.average_min_per_mi.toPrecision(3))
        d3.select("#tooltip").classed("hidden", false);

        var tooltipRect = tooltip.node().getBoundingClientRect()

        d3.select("#tooltip")
            .style("left", (x-tooltipRect.width/2.5) + "px")
            .style("top", y-tooltipRect.height + "px")
    }

    runG.on("mouseout", function(){
        d3.select(this).classed("inactive",true)
        d3.select(d3.event.target).transition().duration(500)
            .style("fill", function(d){return color_scale(d.distance_miles)})
    });

    runG.on("click", function(d){
        window.open("https://strava.com/activities/"+d.id, '_blank');
    })

    d3.select("#vizcontainer")
        .on("click", function(d) { 
            d3.select("#tooltip").classed("hidden", true)
        });


    d3.select("body").selectAll("div.cities")
        .data(run_data)
        .enter()
        .append("div")
        .attr("class","runs")
        .html(function(d,i) { return d.name; })

    

    // Moving average
    /*
    
    To calculate the weighted average:
    weighted_pace = (dist1*pace1+ dist2*pace2)/(dist1+dist2)    

    */

    var points = 7
    var weighted_bin = []
    for(i=0; i<incoming_data.length; i+=points){
        var bin_pace = 0
        var bin_mileage = 0

        for (j=0; j<points; j++){
            if (i+j < incoming_data.length){
                current_run = incoming_data[i+j]
                bin_pace = (bin_mileage * bin_pace + current_run.distance_miles * current_run.average_min_per_mi)/(bin_mileage + current_run.distance_miles)
                bin_mileage += current_run.distance_miles
            }
        }
        weighted_bin.push(bin_pace)
    }
    console.log(weighted_bin)
    var weighted_ramp = d3.scale.linear()
        .domain([0, weighted_bin.length])
        .range([margin,w-margin]);

    var weightedLine = d3.svg.line()
        .x(function(d,i) {
            return weighted_ramp(i)
        })
        .y(function(d){
            return y_scale(d)
        })

    d3.select("svg g")
        .append("path")
        .attr("d", weightedLine(weighted_bin))
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2);


}

