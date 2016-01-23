# pace
Visualizing my running data.  Datasource from Strava's API

Zooming out, bubbles the runs into larger bubbles.

Zooming in 'pops' the bubbles into smaller individual runs.

Bubbling runs together is dependent on a threshold.  The threshold is the number of days that the run falls into.  For 
example, if we set the threshold to 7, then all runs that fall within 7 day moving window of one another are bubbled together.

Bubbling start and end position:

All bubbles are popped if falling under a certain threshold.  Loop through all existing parent bubbles, and if the 
bubble contains child bubbles that are under the threshold, then the parent buble is popped.  The popped bubbles are returned
and will then be passed into the bubbling algorithm.  If there are 'popped' bubbles, the user is zooming in.  
If there are no popped bubbles, the zoom level has not changed or we are zooming out. 

Start positions are determined on the following:

Popped:
Start position is set to the parent bubble.  
End position is set to self

Bubbling:
Start x is set to self
End position is set to parent bubble
