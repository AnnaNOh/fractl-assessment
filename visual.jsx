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


var path = d3.geoPath();

var x = d3.scaleLinear().domain([40, 60]).rangeRound([600, 860]);

// var color = "blue";
// var color = scaleChromatic.interpolateRdBu();
// var color = d3.scaleThreshold().domain(d3.range(40,60)).range(d3.schemeBlues[9]);

d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.csv, "./data/data-states.csv")
  .await(ready);


let data = {};
function ready(error, us, percentOfPop) {
  if (error) throw error;

  // data manipulation of the data-states.csv file
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
        // console.log(json);
      }
    });
  });


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

  const domainMax = 60.0;
  const domainMin = 30;
  const numColors = 9;
  const color = scaleChromatic.schemeBlues[numColors];
  console.log(color);
  // d3.scaleLinear().domain([30, 60]).range(scaleChromatic.schemeBlues[9]);

 // ********************* start from here
  svg.selectAll("path")
      .attr("fill", function(d){
        ((domainMax - domainMin)/ numColors )
        data[d.id]
      });
      // .attr("fill", function(d){
      //   if (data[d.id].PercentofPopulation < 50){
      //     return "blue";
      //   } else {
      //     return "orange";
      //   }
      // });

}
