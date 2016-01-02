
var u_w = 10

canvas_calendar()

function canvas_calendar(){
    var canvas = d3.select("#calendar_container")
        .append("svg")
            .attr("width", w+margin)
            .attr("height", h+margin)
            .append("g")
            .attr("id", "calendar_canvas")
}

function draw_calendar(runs) {
    runs = runs.sort(compare)
    var calendar_canvas = d3.select("#calendar_canvas")
    var calendar_units = calendar_canvas.selectAll(".calendar_unit").data(runs);

    var cur_date = runs[0].run_time
    var i=0,
        j=0,
        k=0;

    while ( i < runs.length ) {
        var run = runs[i]
        if (run.run_time.toDateString() == cur_date.toDateString()) {
            color=color_scale(run.distance_miles)
            cur_date = new Date(cur_date.getTime()-(1000*60*60*24*1))
            i++;
        } else if (run.run_time > cur_date) { // Another date on same day, so let's catchup
            i++;
        } else {
            color="grey"
            cur_date = new Date(cur_date.getTime()-(1000*60*60*24*1))
        }

        if(k%7==0) j++;

        calendar_canvas.append("rect")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("fill", color)
            // .style("opacity", .75)
            .attr("class", "calendar_unit")
            .attr("width",u_w)
            .attr("height",u_w)
            .attr("y",(k%7)*u_w)
            .attr("x",j*u_w)
            // .on("mouseover", highlight)
            // .on("mouseout", unhighlight)
            k++;
    };
}


