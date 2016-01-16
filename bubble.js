function BubbledRuns() {
    this.average_min_per_mi = 0
    this.distance_miles = 0
    this.elevation = 0
    this.total_elevation_gain = 0
    this.run_time
    this.run_time_end
    this.runs = []
    this.name = ""
    this.bubble_id = "b"+Math.ceil(Math.random()*1000000000)
    
    this.start_x = 0
    this.start_y = 0
    this.end_x = 0
    this.end_y = 0

    this.radius = 0

    // We loop through runs in a reverse chronological order
    // run_time_end will usually be the first run
    this.addRun = function(run) {
        if (!(this.runs.length)){
            this.name = run.name
            this.run_time = run.run_time
            this.run_time_end = run.run_time
        } 
        // else {
        //     this.run_time = avg_date(this.run_time, run.run_time)
        // }
        if (this.run_time <= run.run_time)
            this.run_time = run.run_time

        this.average_min_per_mi = avg_pace(this.distance_miles, this.average_min_per_mi, 
            run.distance_miles, run.average_min_per_mi)
        this.distance_miles += run.distance_miles
        this.total_elevation_gain += run.total_elevation_gain
        this.runs.push(run)
    }

    this.tooltip_html = function(){
        var name = ""
        if(this.runs.length < 2){
            name = this.name
        } 
        var date_time = (month[this.run_time.getMonth()])+" "+this.run_time.getDate() + " " + this.run_time_end.getFullYear()
        if(this.runs.length > 1){
            date_time = (month[this.run_time.getMonth()])+" "+this.run_time.getDate() + " - " + this.run_time_end.getDate() + " " + this.run_time_end.getFullYear()
        }
        return "<p><span id=\"run_date\">"+date_time+"</span> \
            <p><strong><a target=\"_blank\" href=\"http://\"><span id=\"run_title\">"+name+"</span></a></strong></p> \
            <p><span id=\"run_distance\">"+parseFloat(this.distance_miles).toPrecision(2)+"</span> mi</p> \
            <p><span id=\"run_pace\">"+min_per_mi_str(this.average_min_per_mi)+"</span></p> \
            <p><span id=\"run_elevation\">"+m_to_ft(this.total_elevation_gain).toFixed(0)+"ft"+"</span></p>"
    }
}

// Used for sorting BubbleRuns
function compare(a,b) {
  if (a.run_time < b.run_time)
    return 1;
  if (a.run_time > b.run_time)
    return -1;
  return 0;
}

BubbledRuns.bubble = function(bubbles, days) {
    var merged_bubbles = []
    if (bubbles.length){
        var br = new BubbledRuns()
        var ref_run = bubbles[0]
        var one_day = 86400000
        var end_window_time = new Date(ref_run.run_time.getTime() - days * one_day);

        bubbles.forEach(function(run){
            if (diff_days(ref_run.run_time, run.run_time) < days && ref_run != run) {
                br.addRun(run)
            } else {
                // var px = x_scale(br.run_time)
                // var py = y_scale(br.average_min_per_mi)  

                // br.runs.forEach(function(b) {
                //     b.end_x = px
                //     b.end_y = py
                // });
                // br.start_x = px
                // br.start_y = py
                // console.log(br)

                br = new BubbledRuns()
                br.addRun(run)
                merged_bubbles.push(br)

                ref_run = run
                end_window_time = new Date(ref_run.run_time.getTime() - days * one_day);
            }
        });
    }
    return merged_bubbles
}

//XXX:  Pop bubs if its under threshold, loop through bubs, pop, delete popped bub.
//      return the values of the bubbles.
//      bubbles values together only if it doesn't contain runs already?
BubbledRuns.pop = function(bubbles, days) {
    var runs = []
    deleted_indexes = []
    bubbles.forEach(function(bubble, i){
        if(bubble.runs.length > 1) { 
            if(diff_days(bubble.runs[0].run_time, bubble.runs[1].run_time) >= days){
                runs = runs.concat(bubble.runs)
                deleted_indexes.push(i)
            }
        }
    });
    // Loop in reverse order because splicing will mess up the indexing
    for (var i=deleted_indexes.length-1; i>=0; i--){
        bubbles.splice(deleted_indexes[i], 1);
    }
    return runs.sort(compare)
}
