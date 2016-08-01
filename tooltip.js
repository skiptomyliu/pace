

/*
    Ensure tooltip isn't cut off by borders
*/
function calc_tooltip_ypos(x,y,rect){
    if (y-rect.height < 0) {
        y_pos = y + rect.height/2.0
    } else {
        y_pos = y - rect.height
    }

    if (x-rect.width/2.5 < 0) { 
        x_pos = x;
    } 
    else if (x+rect.width/2.5 > window.innerWidth) {
        x_pos = x - rect.width
    }
    else {
        x_pos = x - rect.width/2.5
    }
    return [x_pos,y_pos]
}


function highlight(d){
    d3.select(d3.event.target)
        .classed("active",true)
        .style("fill", function(){ return d3.rgb(206, 112, 88) })

    var coord = (d3.transform(d3.select(this).attr("transform"))).translate
    // console.log(d3.select(this).attr("r"))
    var x = coord[0]
    var y = coord[1]    

    var tooltip = d3.select("#tooltip").classed("hidden", false);
    tooltip.html(d.tooltip_html()) // Set content first, then do pos and size calc

    var tooltipRect = tooltip.node().getBoundingClientRect()

    var pos = calc_tooltip_ypos(x,y,tooltipRect)
    tooltip
        .style("left", pos[0] + "px")
        .style("top",  pos[1] + "px")

    var sel = d3.select(this);
    sel.moveToFront();
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};


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



