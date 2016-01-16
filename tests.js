


all_runs = []
d3.json("content3.json", 
    function(error, data) {
        var run_data = data.filter(function (data){
            return data.type == "Run" && data.average_speed > 2.2352 //12 min / mi;
        });

        // Add additional attributes to our run object
        run_data.forEach(function (el){
            // var br = new BubbledRuns()
            el.run_time = new Date(el.start_date)
            el.average_min_per_mi = 26.8224/el.average_speed // Convert to min/mi
            el.distance_miles = m_to_mi(el.distance)
            // br.addRun(el)
            all_runs.push(el)
        });

        QUnit.test("merge test", function(assert) {
            // console.log(all_runs)
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            bubbles.forEach(function(bub){
                console.log('---')
                bub.runs.forEach(function(run){
                    console.log(run.run_time)
                })

            });
            assert.ok( bubbles.length == 5, "success" );
        });

        QUnit.test("pop test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            var popped_bubbles = BubbledRuns.pop(bubbles, .00000001);
            assert.ok(popped_bubbles.length == 8, 'Length of runs from popped bubbles')
            assert.ok(bubbles.length == 2, 'Length after bubbles removed')
        });

        QUnit.test("merge + pop test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            var bef_bub_length = bubbles.length
            var runs = BubbledRuns.pop(bubbles, .00000001);
            var rebubbled_runs = BubbledRuns.bubble(runs, 3)

            assert.ok(rebubbled_runs.length == 3, 'Length after popped runs merge again')
            // combine_bubbles()
            bubbles = bubbles.concat(rebubbled_runs)
            bubbles.sort(compare)
            assert.ok(bubbles.length == 5, 'Length after re-adding to orig bubbles')
            console.log(bubbles)
        });
    }
);


