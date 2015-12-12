

function diff_days(date1, date2){
    var oneDay = 86400000; // milliseconds in 1 day
    return Math.round(Math.abs((date1.getTime() - date2.getTime())/(oneDay)));
}


/*
weighted_pace = (dist1*pace1+ dist2*pace2)/(dist1+dist2)    
*/
function avg_pace(dist1, pace1, dist2, pace2){
    return (dist1*pace1+ dist2*pace2)/(dist1+dist2)
}