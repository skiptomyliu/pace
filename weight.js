// //XXX:  Todo:  move the weight bins into its own file
    // function calculate_weight_bins(runs, bins){
    //     var points = bins
    //     var weighted_bin = []
    //     for(i=0; i<runs.length; i+=points){
    //         var bin_pace = 0
    //         var bin_mileage = 0
    //         for (j=0; j < points; j++){
    //             if (i+j < runs.length){
    //                 current_run = runs[i+j]
    //                 bin_pace = avg_pace(bin_mileage, bin_pace, current_run.distance_miles, current_run.average_min_per_mi)
    //                 bin_mileage += current_run.distance_miles
    //             }
    //         }
    //         weighted_bin.unshift(bin_pace)
    //     }

    //     return weighted_bin
    // }

    // function draw_weighted_avg(runs) {
    //     var weighted_bins = calculate_weight_bins(runs, 7)
    //     var weighted_ramp = d3.scale.linear()
    //         .domain([0, weighted_bins.length])
    //         .range([margin,w-margin]);

    //     var weightedLine = d3.svg.line()
    //         .x(function(d,i) {
    //             var percent = i/weighted_bins.length
    //             //index_date = (end_date) - (percent)*(end_date-start_date)
    //             var end_time = runs[runs.length-1].run_time.getTime()
    //             var start_time = runs[0].run_time.getTime()
    //             new_date = end_time - percent*(end_time-start_time)
    //             weight_date = new Date(new_date)

    //             return x_scale(weight_date) 
    //         })
    //         .y(function(d){
    //             return y_scale(d)
    //         })

    //     d3.select("#weightedLine")
    //         .attr("d", weightedLine(weighted_bins))
    // }