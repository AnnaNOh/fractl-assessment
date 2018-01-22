// US Household Income Map
import * as d3 from "d3";
import * as topojson from "topojson";
import * as scaleChromatic from "d3-scale-chromatic";


const width = 960;
const height = 600;

var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height);

var path = d3.geoPath();

var x = d3.scaleLinear().domain([40, 60]).rangeRound([600, 860]);


// going through data to manipulate it
d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.csv, "./data/data-states.csv")
  .await(ready);
let data = {};
function ready(error, us, percentOfPop) {
  if (error) throw error;

  // changing data-states.csv file's data to integers and removing signs
  let i = 1;
  percentOfPop.forEach( function(d){
    if (i < 10) {
      d.id = "0" + String(i);
    } else {
      d.id = String(i);
    }
    i += 1;
    if (d.PercentofPopulation !== undefined) {
      d.PercentofPopulation = Number(d.PercentofPopulation.slice(0, -1));
      d.MedianHouseholdIncome = Number(d.MedianHouseholdIncome.slice(1).replace(",", ""));
      d.PercentofIncome = Number(d.PercentofIncome.slice(0, -1));
// set data hash with id = state's info from data-states.csv
// data-states file was altered to match order of US census
      data[d.id] = d;
    }
  });


  // push data-states.csv data into us (the d3 json state data)
  us.objects.states.geometries.forEach ( function(json){
    percentOfPop.forEach (function(pop){
      if (json.id === pop.id) {
        json.StateAbbv = pop.StateAbbv;
        json.State = pop.State;
        json.PercentofPopulation = pop.PercentofPopulation;
        json.MedianHouseholdIncome = pop.MedianHouseholdIncome;
        json.PercentofPopulation = pop.PercentofPopulation;
      }
    });
  });


// making the state map
  svg.append("g")
      .attr("class", "us")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("class", function(d){
        return d.id;
      })
      .attr("d", path)
      .attr("stroke", "white")
      .attr("stroke-width", "1");


  console.log(data);


// change the color of the state depending on the percent of population
  const domainMax = 61.0;
  const domainMin = 30.0;
  const numColors = 9.0;
  const increment = (domainMax - domainMin)/ numColors;
  let color = 0;
  const colorScheme = scaleChromatic.schemeBlues[numColors];

  svg.selectAll("path")
      .attr("fill", function(d){
        color = Math.floor((data[d.id].PercentofPopulation - domainMin) / increment);
        return colorScheme[color];
      });


// color legend
  const legendWidth = 300;
  const legendHeight = 8;
  const legendY = 0;
  const legendX = 100;
  const legendTickY = 13;

  let colorIdx = 0;
  while (colorIdx < numColors) {
    svg.append("rect")
        .attr("class", "legendRect")
        .attr("x", legendX + (colorIdx * legendWidth/numColors) )
        .attr("y", legendY)
        .attr("height", legendHeight)
        .attr("width", legendWidth/numColors)
        .attr("fill", colorScheme[colorIdx] );
    svg.append("g")
        .attr("class", "tick")
        .attr("x", legendX + (colorIdx * legendWidth/numColors))
        .append("hr")
        // .attr("x", legendX + (colorIdx * legendWidth/numColors))
        .attr("stroke", "#000")
        .attr("width", 1)
        .attr("height", legendTickY)

        .append("text")
        .text("testing")
        .attr("fill", "#000")
        .attr("font-size", "0.71em");

    console.log(colorIdx);
    colorIdx += 1;

  }


}
