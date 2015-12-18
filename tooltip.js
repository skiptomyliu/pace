


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
    var date_time_end = d.run_time_end; //(d.run_time_end.getMonth()+1)+"/"+d.run_time_end.getDate() + "/" + d.run_time_end.getFullYear()

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
        .style("left", (x-tooltipRect.width/2.5) + "px")
        .style("top", y-tooltipRect.height+ "px")
}