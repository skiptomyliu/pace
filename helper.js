

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

function m_to_mi(m){
    return m * 0.000621371 
}

function pad(num, size){ 
    return ('000000' + num).substr(-size); 
}

function min_per_mi_str(decimal) {
    seconds = pad(((decimal%1) * 59.8).toFixed(0), 2).toString()
    
    min = parseInt(decimal).toString()
    return min+":"+seconds+"/mi"
}

function sec_to_hours(seconds) {
    hours = seconds/(60*60)
    minutes = (hours%1)*60
    seconds = (minutes)%1*60
    return hours.toFixed(0)+":"+minutes.toFixed(0)+":"+seconds.toFixed(0)
}