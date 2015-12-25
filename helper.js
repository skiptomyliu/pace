

function diff_days(date1, date2){
	if (typeof date1 == "undefined" || typeof date2 == "undefined")
		return 0

    var oneDay = 86400000; // milliseconds in 1 day
    return Math.abs((date1.getTime() - date2.getTime())/(oneDay));
}

function avg_pace(dist1, pace1, dist2, pace2){
    return (dist1*pace1+ dist2*pace2)/(dist1+dist2)
}

function avg_date(date1, date2){
	var avgSeconds = (date1.getTime() + date2.getTime())/2

	return new Date(avgSeconds);
}

function m_to_ft(m){
    return m*3.28084
}

function pad(num, size){ 
    return ('000000' + num).substr(-size); 
}

function min_per_mi_str(decimal) {
    seconds = pad(((decimal%1) * 60).toFixed(0),2).toString()
    min = parseInt(decimal).toString()
    return min+":"+seconds+"/mi"
}

function sec_to_hours(seconds) {
    hours = seconds/(60*60)
    minutes = (hours%1)*60
    seconds = (minutes)%1*60
    return hours.toFixed(0)+":"+minutes.toFixed(0)+":"+seconds.toFixed(0)
}

    // var points = 7
    // var weighted_bin = []
    // for(i=0; i<incoming_data.length; i+=points){
    //     var bin_pace = 0
    //     var bin_mileage = 0
    //     for (j=0; j < points; j++){
    //         if (i+j < incoming_data.length){
    //             current_run = incoming_data[i+j]
    //             bin_pace = avg_pace(bin_mileage, bin_pace, current_run.distance_miles, current_run.average_min_per_mi)
    //             bin_mileage += current_run.distance_miles
    //         }
    //     }
    //     weighted_bin.push(bin_pace)
    // }

    // var weighted_ramp = d3.scale.linear()
    //     .domain([0, weighted_bin.length])
    //     .range([margin,w-margin]);


    // var weightedLine = d3.svg.line()
    //     .x(function(d,i) {
    //         return weighted_ramp(i)
    //     })
    //     .y(function(d){
    //         return y_scale(d)
    //     })
    // d3.select("svg g")
    //     .append("path")
    //     .attr("id", "weightedLine")
    //     .attr("d", weightedLine(weighted_bin))
    //     .attr("fill", "none")
    //     .attr("stroke", "blue")
    //     .attr("stroke-width", 2);