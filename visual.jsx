// US Household Income Map
import * as d3 from "d3";
import * as topojson from "topojson";
import * as scaleChromatic from "d3-scale-chromatic";

const width = 960;
const height = 600;

// change color
var fill = "blue";


var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height);

var unemployment = d3.map();

var path = d3.geoPath();

var x = d3.scaleLinear().domain([40, 60]).rangeRound([600, 860]);

var color = "blue";
// var color = scaleChromatic.interpolateRdBu();
// var color = d3.scaleThreshold().domain(d3.range(40,60)).range(d3.schemeBlues[9]);

d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.csv, "./data/data-states.csv")
  .await(ready);

function ready(error, us, percentOfPop) {
  if (error) throw error;

  console.log("PERCENT OF POP HERE");
  console.log(percentOfPop);

  svg.append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "state-borders")
      .attr("d", path);
}
