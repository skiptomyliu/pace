 window.onload = function() {
    var nav_links = d3.selectAll(".navigation a")

    nav_links.on("click", function() {
        d3.selectAll(".container").classed("hidden", true)
        d3.select("#"+this.text+"_container").classed("hidden", false)
    });
}