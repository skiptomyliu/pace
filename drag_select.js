var container = d3.select("#vizcontainer")
var canvas = d3.select("#canvas")

container
    .on( "mousedown", function() {
        if (d3.event.shiftKey) {
            var start_point = d3.mouse(this);
            canvas.append( "rect")
                .attr({
                    rx      : 3,
                    ry      : 3,
                    class   : "selection",
                    x       : start_point[0],
                    y       : start_point[1],
                    width   : 0,
                    height  : 0
                })
        }
})

