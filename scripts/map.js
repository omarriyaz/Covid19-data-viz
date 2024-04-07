// set height and width of the map
const mapWidth = 52;
const mapHeight = 70;

// Set up Map SVG container
const mapSvg = d3.select('#map-viz')
  .append('svg')
  .attr("class", "map-svg")
  .attr('width', `${mapWidth}vw`)
  .attr('height', `${mapHeight}vh`);

// Set up map projection
const projection = d3.geoMercator()
  .center([0, 40])
  .scale(120)
  .translate([window.innerWidth * mapWidth / 200, window.innerHeight * mapHeight / 200]);

// Set up path generator
const path = d3.geoPath().projection(projection);

// Data and color scale
const data = new Map();
const colorScale = d3.scaleThreshold()
  .domain([0, 1000, 10000, 50000, 100000, 250000, 350000, 400000])
  .range(d3.schemeRdPu[9]);

let dates = ["2020-12-31", "2021-12-31", "2022-04-20", "2023-04-13", "2024-02-29"];
let year;

// By default, call selectYear with 2020
selectYear("2020")

function selectYear(yr) {
  if (yr === "2020") {
    year = 0;
  } else if (yr === "2021") {
    year = 1;
  } else if (yr === "2022") {
    year = 2;
  } else if (yr === "2023") {
    year = 3;
  } else if (yr === "2024") {
    year = 4;
  }

  let tempData = new Map();
  // Load map and covid data
  Promise.all([
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'),
    d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv', function (d) {
      if (year == 0) {
        if (d.date === dates[year]) {
          data.set(d.iso_code, d.total_cases_per_million)
        };
      } else {
        if (d.date === dates[year - 1]) {
          tempData.set(d.iso_code, d.total_cases_per_million)
        }
        if (d.date === dates[year]) {
          data.set(d.iso_code, d.total_cases_per_million - tempData.get(d.iso_code))
        };
      }
    }
    )
  ]).then(function (loadData) {
    let map = loadData[0];
    map.features = map.features.filter(d => d.id != "ATA")

    // mouseover function
    let mouseOver = function (event, d) {
      mapTooltip.style('opacity', 1);
      d3.selectAll(".Country")
        .transition()
        .duration(100)
        .style("opacity", .5);
      d3.selectAll(`.${event.target.classList[1]}`)
        .transition()
        .duration(100)
        .style("opacity", 1);
    }

    // mouseout function
    let mouseOut = function (event, d) {
      mapTooltip.style('opacity', 0);
      d3.selectAll(".Country")
        .transition()
        .duration(100)
        .style('opacity', 0.8);
    }

    // mousemove function
    let mouseMove = function (event, d) {
      mapTooltip
        .html(d.properties.name + "<br>" + parseInt(d.total_cases_per_million) + " cases")
        .style("position", "fixed")
        .style("left", (event.x + 15) + "px")
        .style("top", (event.y - (scrollY / 5)) + "px");
    }

    // mouse click function
    let mouseClick = function (event, d) {
      if (d.id !== 'ATA')
        lineGraph(mainData.filter(datum => datum.iso_code === d.id))
      else
        lineGraph(mainData.filter(datum => datum.location === 'World'))
      d3.select(`.${event.target.classList[1]}-gdp`)
        .transition()
        .delay(1000)
        .duration(800)
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        .transition()
        .delay(3000)
        .duration(600)
        .attr("stroke", "black")
        .attr("stroke-width",);
    }

    // map tooltip
    let mapTooltip = d3.select('#map-viz')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '0.5em');

    // Set up zoom behavior
    let zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

    // Apply zoom behavior to the SVG container
    mapSvg.call(zoom);

    // Zoomed function
    function zoomed(event) {
      mapSvg.selectAll("path")
        .attr("transform", event.transform);
    }

    // draw the map
    mapSvg.append("g")
      .selectAll('path')
      .data(map.features)
      .enter()
      .append('path')
      .attr('d', d3.geoPath().projection(projection))
      .attr('fill', function (d) {
        d.total_cases_per_million = data.get(d.id) || 0;
        return colorScale(d.total_cases_per_million);
      })
      .style('stroke', 'black')
      .attr("class", function (d) {
        return `Country ${d.id}`
      })
      .style('opacity', 0.8)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("mousemove", mouseMove)
      .on("click", mouseClick)
      .on("zoom", zoom);

  });
}