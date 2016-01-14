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
    
    this.parent_x = 0
    this.parent_y = 0

    this.start_x = 0
    this.start_y = 0


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