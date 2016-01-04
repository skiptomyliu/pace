

var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


function highlight(d){
    d3.select(d3.event.target).classed("active",true)
        .style("fill", function(){ return d3.rgb(206, 112, 88) })

    var coord = (d3.transform(d3.select(this).attr("transform"))).translate

    var x = coord[0]
    var y = coord[1]

    var tooltip = d3.select("#tooltip").classed("hidden", false);
    var tooltipRect = tooltip.node().getBoundingClientRect()

    var x = d3.event.pageX
    var y = d3.event.pageY

    tooltip
        .style("left", (x-tooltipRect.width/2.5) + "px")
        .style("top", y-tooltipRect.height+ "px")

    tooltip.html(d.tooltip_html())
}


function unhighlight(d) {
    d3.select("#tooltip").classed("hidden", true)
    d3.select(this).classed("inactive",true)
    d3.select(d3.event.target).transition().duration(500)
        .style("fill", function(d){
            return color_scale(d.distance_miles)
        })
}

function unhighlight_distance(d) {
    d3.select("#tooltip").classed("hidden", true)
    d3.select(this).classed("inactive",true)
    d3.select(d3.event.target).transition().duration(500)
        .style("fill", function(d){
            return d3.rgb(90, 155, 212)
        })
}



