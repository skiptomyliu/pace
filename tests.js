


all_runs = []
all_runs2 = []
d3.json("content3.json", 
    function(error, data) {
        var run_data = data.filter(function (data){
            return data.type == "Run" && data.average_speed > 2.2352 //12 min / mi;
        });

        // Add additional attributes to our run object
        run_data.forEach(function (el){
            el.run_time = new Date(el.start_date)
            el.average_min_per_mi = 26.8224/el.average_speed // Convert to min/mi
            el.distance_miles = m_to_mi(el.distance)
            var br = new BubbledRuns()
            br.addRun(el)
            all_runs.push(br)
            all_runs2.push(el)
        });

        QUnit.test("bubble test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            bubbles.forEach(function(bub){
                console.log('---')
                bub.runs.forEach(function(run){
                    console.log(run.run_time)
                })
            });
            assert.ok(bubbles.length == 5, "success" );
            assert.ok(bubbles[0].runs[0].constructor.name != 'BubbledRuns')
            // assert.ok(bubbles[0].runs)
        });

        QUnit.test("pop length test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            var popped_bubbles = BubbledRuns.pop(bubbles, .00000001);
            assert.ok(popped_bubbles.length == 8, 'Length of runs from popped bubbles')
            assert.ok(bubbles.length == 2, 'Length after bubbles removed')
        });

        QUnit.test("pop start/end test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            var popped_bubbles = BubbledRuns.pop(bubbles, .00000001);
            assert.ok(popped_bubbles[0].start_bub!=undefined, 'Not undefined')
        });

        QUnit.test("merge + pop test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            var bef_bub_length = bubbles.length
            var runs = BubbledRuns.pop(bubbles, .00000001);
            var rebubbled_runs = BubbledRuns.bubble(runs, 3)

            assert.ok(rebubbled_runs.length == 3, 'Length after popped runs merge again')
            bubbles = BubbledRuns.combine(bubbles, rebubbled_runs)
            assert.ok(bubbles.length == 5, 'Length after re-adding to orig bubbles')
        });

        QUnit.test("add bubble test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            var total_length = bubbles[0].runs.length + bubbles[1].runs.length
            bubbles[0].addBubble(bubbles[1])
            assert.ok(bubbles[0].runs.length == total_length, 'Length after adding')
        });

        QUnit.test("merge 2x test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            bubbles = BubbledRuns.bubble(bubbles, 3)
            console.log(bubbles)
            assert.ok(bubbles.length == 5, "success");
        });

        QUnit.test("pop 2x test", function(assert) {
            var bubbles = BubbledRuns.bubble(all_runs, 3)
            var popped_bubbles = BubbledRuns.pop(bubbles, .00000001);
            var popped_bubbles2 = BubbledRuns.pop(popped_bubbles, .00000001);
            var bubbles = BubbledRuns.combine(popped_bubbles, popped_bubbles2)
            console.log(bubbles)
            assert.ok(bubbles.length == 8, "success");
        });

        // QUnit.test("start_bub merge test", function(assert) {
        //     var bubbles = BubbledRuns.bubble(all_runs, 3)
        //     bubbles = BubbledRuns.bubble(bubbles, 3)
        //     console.log(bubbles)
        //     assert.ok(bubbles.length == 5, "success");
        // });

        // QUnit.test("start_bub merge after bub test", function(assert) {
        //     var bubbles = BubbledRuns.bubble(all_runs, 3)
        //     bubbles = BubbledRuns.bubble(bubbles, 3)
        //     console.log(bubbles)
        //     assert.ok(bubbles.length == 5, "success");
        // });

        // QUnit.test("merge 2x test", function(assert) {
        //     var bubbles = BubbledRuns.bubble(all_runs, 3)
        //     bubbles = BubbledRuns.bubble(bubbles, 3)
        //     console.log(bubbles)
        //     assert.ok(bubbles.length == 5, "success");
        // });
    }
);


