


canvas_distance()

function Distances(distance, date) {
    this.distance_miles = distance
    this.start_date = date
    this.tooltip_html = function() {
        var date_time = (month[this.start_date.getMonth()])+" "+this.start_date.getDate() + " " + this.start_date.getFullYear()
        return "<p>"+date_time+"</p> \
                <p>"+this.distance_miles.toFixed(0)+"mi </p>"
    }
}

function canvas_distance(){
    var canvas = d3.select("#distance_container")
        .append("svg")
            .attr("width", w+margin)
            .attr("height", h+margin)
            .append("g")
            .attr("id", "distance_canvas")
}

function translate_distances(d,i){
    return "translate("+x_scale(date_bins[i])+","+(y_scale_distances(max_distance-distance_bins[i].distance_miles) )+")"
}

var date_bins = []
var distance_bins = []
function draw_total_distance(runs) {
    var distance_canvas = d3.select("#distance_canvas")

    runs.reverse()

    var cur_date = runs[0].run_time
    date_bins.push(cur_date)
    cur_total = 0;
    all_total = 0;
    var i = 0;
    while ( i < runs.length ) {
        var run = runs[i]
        if (run.run_time.toDateString() == cur_date.toDateString()) {
            cur_total += run.distance_miles
            i++;
        } else if (run.run_time < cur_date) { // Another date on same day, so let's catchup
            i++;
        } else {
            all_total += cur_total;
            distance_bins.push(new Distances(all_total, cur_date))
            cur_date = new Date(cur_date.getTime()+(1000*60*60*24*1)) // 24 hours

            date_bins.push(cur_date)
            cur_total = 0
        }
    };

    max_distance = distance_bins[distance_bins.length-1].distance_miles
    console.log(max_distance)

    y_scale_distances = d3.scale.linear().domain([0,max_distance]).range([0, h])
    y_axis_distance = d3.svg.axis().scale(y_scale_distances).orient("left")
        .ticks(10)

    var yaxisdistanceg = distance_canvas.append("g")
        .attr("id", "yAxisDistanceG")
        .attr("class", "y axis")
        .attr("transform", "translate("+(margin)+","+(0)+")")
        .call(y_axis_distance)

    x_axis_distance = d3.svg.axis().scale(x_scale).orient("bottom").ticks(10).tickSize(20,0)
    var xaxisg = distance_canvas.append("g")
        .attr("id", "xAxisG")
        .attr("class", "x axis")
        .attr("transform","translate(0,"+(h)+")")
        .call(x_axis_distance)


    distance_canvas.append("g")
        .attr("id", "distanceG")

    var svg = d3.select("#distanceG")
    var grects = svg.selectAll("rect").data(distance_bins)


    grects.enter()
        .append("rect")
        // .style("stroke-width", "1px")
        .style("fill", d3.rgb(90, 155, 212))
        .style("opacity", 1)
        .attr("class", "distance_rect")
        .attr('width',2)
        .on("mouseover", highlight)
        .on("mouseout", unhighlight_distance)

    grects
        .attr("transform", translate_distances)
        .attr("height", function(d) { return y_scale_distances(d.distance_miles) })

    grects.exit()
        .transition().duration(500)
        .attr('width',0)
        .remove();
}

