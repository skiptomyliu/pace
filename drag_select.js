

var container = d3.select("#vizcontainer")

var saved_zoom;


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


    width=1400
    height=500
    function reset() {
        var zoomie = d3.behavior.zoom()
        // zoomie.scale(1)
        // zoomie.translate([0,0])
        console.log("WTF")
        dragging = false
        d3.select('svg').call(zoom, function(){});

        d3.transition().duration(750).tween("zoom", function() {
            x_scale = d3.time.scale().domain(start_end).range([margin,w-margin]);

            var ix = d3.interpolate(x_scale.domain(), [-w / 2, w / 2]),
                iy = d3.interpolate(y_scale.domain(), [-h / 2, h / 2]);

            return function(t) {
                // debugger;
                zoom.x(x_scale.domain(ix(t)))
                zoom.y(y_scale.domain(iy(t)));
                d3.select("#xAxisG").call(x_axis)
            };
          });



         // y_scale = d3.scale.linear().domain([min_average_speed, max_average_speed]).range([500, 0])
         // var y_axis = d3.svg.axis().scale(y_scale).orient("left")


        // d3.select("#vizcontainer")
            // .attr("transform", "translate" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }




     var move = d3.behavior.drag()
        .on('dragstart', function(){
            d3.event.sourceEvent.stopPropagation()
            console.log("START")

             d3.select('svg')
                .on('mousedown.zoom',function() { d3.event.stopPropagation(); })
                .on("mousedown.zoom", null)
                .on("touchstart.zoom", null)
                .on("touchmove.zoom", null)
                .on("touchend.zoom", null)
                .on("click", null)
                .on("mouseup", null)
        })
        .on('drag', function () {
            if (d3.event.sourceEvent.shiftKey) {
                dragging=true
                console.log('dragging');
                d3.event.sourceEvent.stopPropagation()
            }
            var curr = d3.select(this)
                .attr({
                    cx: d3.mouse(this)[0],
                    cy: d3.mouse(this)[1]
                })
        })
        .on('dragend', function () {
            var curr = d3.select(this);
            d3.select('#playground')
                .append('circle')
                .attr({
                    cx: curr.attr('cx'),
                    cy: curr.attr('cy'),
                    r: curr.attr('r')
                })
                .style({
                    fill: 'white',
                    stroke: 'red',
                    'stroke-width': '2px'
                })
            ;

            curr.attr({
                cx: curr.attr('init-cx'),
                cy: curr.attr('init-cx')
            });
            d3.select("#vizcontainer").call(zoom);
            dragging=false
        });

    d3.select("#vizcontainer").call(move);
*/

