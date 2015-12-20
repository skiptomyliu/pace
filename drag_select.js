

var container = d3.select("#vizcontainer")
var savedTranslation = null;
var savedScale = null;

function zoomstart() {
    var canvas = d3.select("#canvas")
    if (d3.event.sourceEvent.shiftKey) {
        var start_point = d3.mouse(this);

        canvas.append("rect")
            .attr({
                rx      : 3,
                ry      : 3,
                class   : "selection",
                x       : start_point[0],
                y       : start_point[1],
                width   : 0,
                height  : 0
            })

        if (savedScale === null){
            savedScale = zoom.scale();
        }
        if (savedTranslation === null){
            savedTranslation = zoom.translate();
        }  

        console.log(savedScale)
        console.log(savedTranslation)
    }
}

function zooming() {
    if (d3.event.sourceEvent.shiftKey) {
        var s = container.select("rect.selection");

        if(!s.empty()) {
            var p = d3.mouse(this),
                d = {
                    x       : parseInt(s.attr("x"), 10),
                    y       : parseInt(s.attr("y"), 10),
                    width   : parseInt(s.attr("width"), 10),
                    height  : parseInt(s.attr("height"), 10)
                },
                move = {
                    x : p[0] - d.x,
                    y : p[1] - d.y
                }
            ;

            if(move.x < 1 || (move.x*2 < d.width)) {
                d.x = p[0];
                d.width -= move.x;
            } else {
                d.width = move.x;       
            }

            if(move.y < 1 || (move.y*2 < d.height)) {
                d.y = p[1];
                d.height -= move.y;
            } else {
                d.height = move.y;       
            }
            
            s.attr(d);

            d3.selectAll('circle').each( function(run_data, i) {
                // Determine if rect encapsulates any circles
                radius = parseFloat(this.getAttribute("r"))
                var cpos = d3.transform(this.getAttribute("transform")).translate
                if( d.x+d.width >= (cpos[0]+radius) && d.x <= (cpos[0]-radius) &&
                    d.y+d.height >= (cpos[1]+radius) && d.y <= (cpos[1]-radius) ){  

                    d3.select(this)
                        .style("fill", function(){return "purple"})

                    d3.select( this.parentNode)
                        .classed("selection", true)
                        .classed("selected", true);
                } else{
                    d3.select(this)
                        .style("fill", function(){return "red"})
                }
            });
        }
    } else {
        d3.select("#vizcontainer svg").call(zoom)
        var threshold = calculate_bubble_thresh()
        sub_runs = get_runs_window(all_runs)
        calculate_ranges(sub_runs)
        d3.select("#xAxisG")
            .call(x_axis);
        d3.selectAll("circle")
            .attr("transform", translate_runs)

        draw_elevation_chart(all_runs)
    }   
}

function zoomend(){
    d3.select("#vizcontainer svg").call(zoom)

    container.selectAll("rect.selection").remove(); // remove selection frame
    d3.selectAll('g.state.selection').classed( "selection", false); // remove temporary selection marker class

    if (savedScale !== null){
        zoom.scale(savedScale);
        savedScale = null;
    }
    if (savedTranslation !== null){
        zoom.translate(savedTranslation);
        savedTranslation = null;
    }
}

/*

container
    .on( "mousedown", function() {
        d3.event.stopPropagation()

        var canvas = d3.select("#canvas")
        // d3.select('svg')
        //     .on('mousedown.zoom',function() { d3.event.stopPropagation(); })
        //     .on("mousedown.zoom", null)
        //     .on("touchstart.zoom", null)
        //     .on("touchmove.zoom", null)
        //     .on("touchend.zoom", null)
        //     .on("click", null)
        //     .on("mouseup", null)


        if (d3.event.shiftKey) {
            saved_zoom_x = x_scale.domain()
            saved_zoom_y = y_scale.domain()
            console.log(saved_zoom_x)
            zoomb = d3.behavior.zoom()


            dragging = true
            var start_point = d3.mouse(this);
            canvas.append("rect")
                .attr({
                    rx      : 3,
                    ry      : 3,
                    class   : "selection",
                    x       : start_point[0],
                    y       : start_point[1],
                    width   : 0,
                    height  : 0
                })
        } else{
            console.log("setting to false")
            dragging = false
            d3.select('svg').call(zoom, function(){});
        }
    })
    .on( "mousemove", function() {
        var s = container.select( "rect.selection");

        if(!s.empty()) {
            var p = d3.mouse(this),
                d = {
                    x       : parseInt(s.attr("x"), 10),
                    y       : parseInt(s.attr("y"), 10),
                    width   : parseInt(s.attr("width"), 10),
                    height  : parseInt(s.attr("height"), 10)
                },
                move = {
                    x : p[0] - d.x,
                    y : p[1] - d.y
                }
            ;

            if(move.x < 1 || (move.x*2 < d.width)) {
                d.x = p[0];
                d.width -= move.x;
            } else {
                d.width = move.x;       
            }

            if(move.y < 1 || (move.y*2 < d.height)) {
                d.y = p[1];
                d.height -= move.y;
            } else {
                d.height = move.y;       
            }
            
            s.attr(d);

            d3.selectAll('circle').each( function(run_data, i) {
                // Determine if rect encapsulates any circles
                radius = parseFloat(this.getAttribute("r"))
                var cpos = d3.transform(this.getAttribute("transform")).translate
                if( d.x+d.width >= (cpos[0]+radius) && d.x <= (cpos[0]-radius) &&
                    d.y+d.height >= (cpos[1]+radius) && d.y <= (cpos[1]-radius) ){  

                    d3.select(this)
                        .style("fill", function(){return "purple"})

                    d3.select( this.parentNode)
                        .classed("selection", true)
                        .classed("selected", true);
                } else{
                    d3.select(this)
                        .style("fill", function(){return "red"})
                }
            });
        }
    })
    .on("mouseup", function() {
        container.selectAll("rect.selection").remove(); // remove selection frame
        d3.selectAll('g.state.selection').classed( "selection", false); // remove temporary selection marker class

        console.log("setting the saved")
  
        reset()
    })



*/

