

function diff_days(date1, date2){
	if (typeof date1 == "undefined" || typeof date2 == "undefined")
		return 0

    var oneDay = 86400000; // milliseconds in 1 day
    return Math.round(Math.abs((date1.getTime() - date2.getTime())/(oneDay)));
}

function avg_pace(dist1, pace1, dist2, pace2){
    return (dist1*pace1+ dist2*pace2)/(dist1+dist2)
}

function avg_date(date1, date2){
	var avgSeconds = (date1.getTime() + date2.getTime())/2

	return new Date(avgSeconds);
}