function BubbledRuns() {
    this.average_min_per_mi = 0
    this.distance_miles = 0
    this.elevation = 0
    this.total_elevation_gain = 0
    this.run_time
    this.run_time_end
    this.runs = []
    this.bubble_id = "b"+Math.ceil(Math.random()*100000000)

    // We loop through runs in a reverse chronological order
    // run_time_end will usually be the first run
    this.addRun = function(run) {
        if (!(this.runs.length)){
            this.run_time = run.run_time
            this.run_time_end = run.run_time
        } 
        // else {
        //     this.run_time = avg_date(this.run_time, run.run_time)
        // }
        if (this.run_time >= run.run_time)
            this.run_time = run.run_time

        this.average_min_per_mi = avg_pace(this.distance_miles, this.average_min_per_mi, 
            run.distance_miles, run.average_min_per_mi)
        this.distance_miles += run.distance_miles
        this.total_elevation_gain += run.total_elevation_gain
        this.runs.push(run)
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