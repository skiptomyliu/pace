
/*

Handle user interaction: zooming and selection

*/
var container = d3.select("#vizcontainer")
var savedTranslation = null;
var savedScale = null;
var selectedRuns = new Set();

function zoomstart() {
    selectedRuns.clear()

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
                };

            if(move.x < 1 || (move.x*2 < d.width)) {
                d.x = p[0];
                d.width -= move.x;
            } else {
                d.width = move.x;       
            }

            if(move.y < 1 || (move.y*2 < d.height)) {
                d.y = p[1]
                d.height -= move.y
            } else {
                d.height = move.y       
            }
            
            s.attr(d);

            d3.selectAll('circle').each(function(run_data, i) {
                // Determine if rect encapsulates any circles
                d3.select(this)
                    .classed("selected", false)
                radius = parseFloat(this.getAttribute("r"))
                var cpos = d3.transform(this.getAttribute("transform")).translate
                if( d.x + d.width  >= (cpos[0] + radius) && d.x <= (cpos[0] - radius) &&
                    d.y + d.height >= (cpos[1] + radius) && d.y <= (cpos[1] - radius) ){  

                    d3.select(this)
                        .style("fill", function(){ return "purple" })
                        .classed("selected", true);

                } else {
                    d3.select(this)
                        .style("fill", function(){return "red"})
                }
            });
        }
    } else {
        // var threshold = calculate_bubble_thresh()
        // sub_runs = get_runs_window(focused_runs)
        // update_ranges(sub_runs)
        d3.select("#xAxisG")
            .call(x_axis);
        
        d3.selectAll("circle")
            .attr("transform", translate_runs)

        d3.selectAll(".elevation_rect")
            .attr("transform", translate_elevations)
    }   
}

function zoomend(){
    // Resume zoom/pan from saved state to prevent jumpiness
    if (savedScale !== null){
        zoom.scale(savedScale);
        savedScale = null;
    }
    if (savedTranslation !== null){
        zoom.translate(savedTranslation);
        savedTranslation = null;
    }
    container.selectAll("rect.selection").remove(); // remove selection rectangle

    // Add runs we have selected
    d3.selectAll('.selected').each(function(bubble,i){
        console.log(bubble)
        bubble.runs.forEach(function(run){
            selectedRuns.add(run)
        })
        
    });
    d3.selectAll('.selected').classed("selected", false);

    // If we have selected runs, we set the new focus of runs
    if (selectedRuns.size) {
        sub_runs = Array.from(selectedRuns)
        focused_runs = sub_runs;
        update_ranges(sub_runs)
        update_scales()
        bucket_runs(sub_runs)
        update_axis()
    } 
    data_viz(focused_runs)
}
