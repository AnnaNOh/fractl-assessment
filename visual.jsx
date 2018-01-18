// US Household Income Map
import * as d3 from "d3";




const svg = d3.select("svg"),
      width = svg.attr("width"),
      height = svg.attr("height");


const percentOfPop = d3.map();

const path = d3.geoPath();

const x = d3.scaleLinear()
            .domain([1,10])
            .rangeRound([600, 860]);

const color = d3.scaleThreshold().domain(d3.range(2,10)).range(d3.schemeBlues[9]);
