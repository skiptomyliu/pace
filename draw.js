

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

    var start_end = d3.extent(incoming_data, function(el){
        return el.run_time
    });

    var max_distance_miles = d3.max(incoming_data, function(el){
        return el.distance_miles
    })

    var color_scale = d3.scale.linear().domain([0, max_distance_miles]).range(["white", "#990000"])
    var time_ramp = d3.time.scale().domain(start_end).range([20,1350]);
    var x_scale = time_ramp
    var y_scale = d3.scale.linear().domain([0, max_average_speed]).range([-550,460])
    var radius_scale = d3.scale.linear().domain([0, max_distance_miles]).range([1,20])

    var runG = d3.select("svg")
        .selectAll("circle")
        .data(incoming_data)
        .enter()
        .append("circle")
        .attr("r", function(d) {return radius_scale(d.distance_miles)})
        .attr("cx", function(d,i) {return time_ramp(d.run_time);})
        .attr("cy", function(d) {return 500 - y_scale(d.average_min_per_mi);})
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("fill", function(d) {return color_scale(d.distance_miles)})
    

    d3.select("body").selectAll("div.cities")
        .data(run_data)
        .enter()
        .append("div")
        .attr("class","runs")
        .html(function(d,i) { return d.name; })

    // Draw axis
    var y_axis = d3.svg.axis().scale(y_scale).orient("right")
    d3.select("svg").append("g").attr("id", "yAxisG").call(y_axis)
    var x_axis = d3.svg.axis().scale(x_scale).orient("bottom")
    d3.select("svg").append("g").attr("id", "xAxisG").call(x_axis)
    d3.selectAll("path.domain").style("fill", "none").style("stroke", "black");
    d3.selectAll("line").style("stroke", "black");
}






