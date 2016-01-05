
var u_w = 12
var h_m=100
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

    var one_day = 1000*60*60*24*1
    var data = []
    var cur_bubble;
    var br;
    while ( i < runs.length ) {
        var run = runs[i]
        if (run.run_time.toDateString() == cur_date.toDateString()) {
            br = new BubbledRuns()
            br.addRun(run)
            data.push(br)
            color = color_scale(run.distance_miles)
            cur_date = new Date(cur_date.getTime() - (one_day))
            i++;
        } else if (run.run_time > cur_date) { // Another date on same day, so let's catchup
            i++;
        } else {
            br = new BubbledRuns()
            br.name = "No run"
            br.run_time = cur_date
            br.run_time_end = cur_date
            data.push(br)

            color = "grey"
            cur_date = new Date(cur_date.getTime() - (one_day))
        }
    };

    var svg = d3.select("#runsG") // redo this variable
    var grects = calendar_canvas.selectAll("rect").data(data);


    function translate_grid(d,i){
        if(i%7==0){
            j++;
        };
        return "translate("+((j)*u_w+h_m)+","+(((i%7)*u_w)+200)+")"
    }

    grects.enter()
        .append("rect")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", .75)
        .attr("transform", translate_runs)
        .attr("class", "calendar_rect")
        .attr("width", u_w)
        .attr("height",u_w)
        .style("fill", function(d) { return color_scale(d.distance_miles) })
        .on("mouseover", highlight)
        .on("mouseout", unhighlight)

    grects
        .attr("transform", translate_grid)

}


