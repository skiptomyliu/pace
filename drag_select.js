
/*

Handle user interaction: zooming and selection

*/
var container = d3.select("#pace_container")
var savedTranslation = null;
var savedScale = null;
var selectedRuns = new Set();

function zoomstart() {

}

function zooming() {
    d3.select("#xAxisG")
        .call(x_axis);
    
    d3.selectAll("circle")
        .attr("transform", translate_runs)

    d3.selectAll(".elevation_rect")
        .attr("transform", translate_elevations)
}

function zoomend(){
    data_viz(bubble_data)
}
