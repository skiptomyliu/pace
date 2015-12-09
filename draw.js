

var w = 1400;
var h = 500;
var margin = 40;

d3.json("content.json", 
    function(error, data) {
        // Get runs only
        run_data = data.filter(function (data){
            return data.type == "Run" && data.average_speed > 2.2352 //12 min / mi;
        });
        console.log(run_data)
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
        // .nice(d3.time.week)
        .range([margin,w-margin]);
    var x_scale = time_ramp
    var y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])
    var radius_scale = d3.scale.linear().domain([0, max_distance_miles]).range([1,20])

    d3.select("svg")    
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
        // d3.select(d3.event.target).transition().duration(500)
            .style("fill", function(){return "red"})
    }

    runG.on("mouseout", function(){
        d3.select(this).classed("inactive",true)
        d3.select(d3.event.target).transition().duration(500)
            .style("fill", function(d){return color_scale(d.distance_miles)})
    });


    // runG.append("text")
    //     .style("text-anchor", "middle")
    //     .attr("y", 30)
    //     .style("font-size", "10px")
    //     .text(function(d) {return d.name});

    d3.select("body").selectAll("div.cities")
        .data(run_data)
        .enter()
        .append("div")
        .attr("class","runs")
        .html(function(d,i) { return d.name; })

    // Draw axis
    var y_axis = d3.svg.axis().scale(y_scale).orient("left")
    var yaxisg = d3.select("svg").append("g")
        .attr("id", "yAxisG")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin+",0)")
        .call(y_axis)

    yaxisg.selectAll("line").data(y_scale.ticks(64), function(d){return d;})
        .enter()
        .append("line")
        .attr("class", "minor")

    var x_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(10).tickSize(20,0)
    var xaxisg = d3.select("svg").append("g")
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
      .attr("x2", x_scale);

    // d3.selectAll("path.domain").style("fill", "none").style("stroke", "black");
    // d3.selectAll("line").style("stroke", "black");

}






