// US Household Income Map
import * as d3 from "d3";
import * as topojson from "topojson";
import * as scaleChromatic from "d3-scale-chromatic";


const width = 960;
const height = 700;


var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height);

var path = d3.geoPath();

var x = d3.scaleLinear().domain([40, 60]).rangeRound([600, 860]);


const legendValues = [];




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
      let stateName = [];
      d.State = d.State.split(" ").forEach( function(word){
        stateName.push(word.slice(0,1).toUpperCase() + word.slice(1));
      });
      d.State = stateName.join(" ");
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
      .attr("x", "100")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("class", function(d){
        return `state ${d.id}` ;
      })
      .attr("d", path)
      .attr("stroke", "white")
      .attr("stroke-width", "2");


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
  const legendWidth = 20;
  const legendHeight = 20;
  const legendY = 680;
  const legendX = 50;
  const legendXSpace = 80;
  const legendTickY = 13;


  let colorIdx = 0;
  while (colorIdx < numColors) {
    svg.append("rect")
        .attr("class", "legendRect")
        .attr("x", legendX + (colorIdx * (legendWidth + legendXSpace)))
        .attr("y", legendY)
        .attr("height", legendHeight)
        .attr("width", legendWidth)
        .attr("fill", colorScheme[colorIdx] )
        .attr("border", "1px solid black");

    colorIdx += 1;
  }



  // added Legend Title
  var graph = document.getElementsByClassName("graph");
  graph = graph[0];
  let legendTitle = document.createElement("div");
  legendTitle.innerHTML = "Percent of Population";
  legendTitle.className = "legendTitle";
  graph.appendChild(legendTitle);

  let legendTextHolder = document.createElement("div");
  legendTextHolder.className = "legendTextHolder";
  legendTitle.appendChild(legendTextHolder);

  // added Legend Text
  colorIdx = 0;
  let legendText = document.createElement("div");
  while (colorIdx < numColors) {
    let cln = legendText.cloneNode(true);
    cln.innerHTML = `${(Math.round((domainMin + (increment * colorIdx)))) }
                    to
                    ${ (Math.round( (domainMin + (increment * (colorIdx+1) ) ) - 1 )) }`;
    cln.className = `legendText item${colorIdx}`;
    legendTextHolder.appendChild(cln);

    colorIdx += 1;
  }



  //added Hover Information
  let hoverInfo = document.createElement("div");
  hoverInfo.className = "hoverInfo";
  graph.appendChild(hoverInfo);

  // Added State's Name and Abbv
  let stateNameDiv = document.createElement("div");
  stateNameDiv.className = "stateNameDiv";
  hoverInfo.appendChild(stateNameDiv);

  let stateName = document.createElement("div");
  stateName.className = "stateName";
  stateNameDiv.appendChild(stateName);

  let stateAbbv = document.createElement("div");
  stateAbbv.className = "stateAbbv";
  stateNameDiv.appendChild(stateAbbv);

  // State's Other Info
  let statePercentofIncome = document.createElement("div");
  statePercentofIncome.className = "statePercentofIncome";
  hoverInfo.appendChild(statePercentofIncome);

  let statePercentofPop = document.createElement("div");
  statePercentofPop.className = "statePercentofPop";
  hoverInfo.appendChild(statePercentofPop);

  let stateHouseholdIncome = document.createElement("div");
  stateHouseholdIncome.className = "stateHouseholdIncome";
  hoverInfo.appendChild(stateHouseholdIncome);



  // added hover listener to adjust hovered over state's color
  let states = document.getElementsByClassName("state");
  let stateIdx = 0;
  let currentState = null;
  while (stateIdx < states.length) {

    states[stateIdx].addEventListener("mouseover", function(hovered) {
      // remove orange color for states that are not being hovered over
      if (currentState != hovered.toElement.classList && currentState != null) {
        currentState.remove("hovered");
      }

      // set hovered over state's color to orange
      currentState = hovered.toElement.classList;
      hovered.toElement.classList.add("hovered");


      // adjust hovered state's name for data viewing
      let hoveredClassName = Number(hovered.toElement.className.baseVal.slice(5, 8));
      if (hoveredClassName < 10) {
        hoveredClassName = "0" + hoveredClassName.toString();
      }
      // show data relevant to hovered over state
      let hoverData = data[hoveredClassName];
      stateAbbv.innerHTML = hoverData.StateAbbv;
      stateName.innerHTML = hoverData.State;
      stateHouseholdIncome.innerHTML = `Median Household Income: $${hoverData.MedianHouseholdIncome.toString().slice(0,2)},${hoverData.MedianHouseholdIncome.toString().slice(2)}`;
      statePercentofPop.innerHTML = `Percent of Population: ${hoverData.PercentofPopulation}%`;
      statePercentofIncome.innerHTML = `Percent of Income: ${hoverData.PercentofIncome}%`;
    });

    states[stateIdx].addEventListener("mouseout", function(hovered) {
      // removes hovered state's orange coloring when no longer hovering over the map
      if (currentState != hovered.toElement.classList) {
        currentState.remove("hovered");
      }
    });

    stateIdx += 1;
  }




// notes to improve upon

// add better font
// change words to be centered by adding a note like "hover to center text"
// add more padding in general



}
