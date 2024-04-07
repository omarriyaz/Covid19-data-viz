const bubbleChart = (data) => {

  // remove countries with no GDP or very low GDP to avoid clutter 
  data = data.filter(d => d.total_vaccinations > 1);
  data = data.filter(d => d.total_deaths_per_million > 1);

  // set the dimensions and margins of the graph
  const bubbleChartMargin = { top: 40, right: 20, bottom: 38, left: 80 };
  const bubbleChartWidth = 650 - bubbleChartMargin.left - bubbleChartMargin.right;
  const bubbleChartHeight = 420 - bubbleChartMargin.top - bubbleChartMargin.bottom;

  // append the svg object to the body of the page
  const bubbleChartSVG = d3.select("#bubble-chart-viz")
    .append("svg")
    .attr("width", bubbleChartWidth + bubbleChartMargin.left + bubbleChartMargin.right)
    .attr("height", bubbleChartHeight + bubbleChartMargin.top + bubbleChartMargin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + bubbleChartMargin.left + "," + bubbleChartMargin.top + ")");

  // create a tooltip
  const bubbleChartTooltip = d3.select("#bubble-chart-viz")
    .append("div")
    .style("opacity", 0)
    .style("display", "none")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "0.3em");

  const mouseOver = (event, d) => {
    bubbleChartTooltip.style("opacity", 1)
      .style("display", "block");
  }

  const mouseMove = (event, d) => {
    bubbleChartTooltip
      .html('<u>' + d.location + '</u>' + "<br>" + parseInt(d.total_deaths_per_million) + " deaths per million")
      .style("position", "fixed")
      .style("display", "block")
      .style("left", (event.x + 15) + "px")
      .style("top", (event.y) + "px");
  };

  const mouseLeave = (event, d) => {
    bubbleChartTooltip.style("opacity", 0)
      .style("display", "none");
  }

  const mouseClick = (event, d) => {
    d3.selectAll(".Country")
      .transition()
      .delay(1000)
      .duration(100)
      .style("opacity", .5)
      .transition()
      .delay(3000)
      .duration(200)
      .style("opacity", 1);
    d3.selectAll(`.${d.iso_code}`)
      .transition()
      .duration(100)
      .style("opacity", 1);
  }

  // Initialize scales
  let x = d3.scaleLinear()
    .domain([-5000000, 200000000])
    .range([0, bubbleChartWidth]);

  let y = d3.scaleLinear()
    .domain([0, 10000])
    .range([bubbleChartHeight, 0]);

  // Define a custom formatting function
  const formatNumber = d3.format(".1s"); // Format numbers with SI-prefix notation (e.g., 1.2M)

  // Add X axis - Total Vaccinations
  const xAxis = bubbleChartSVG.append("g")
    .attr("transform", "translate(0," + bubbleChartHeight + ")")
    .attr("class", "x-axis")
    .attr("color", "#fff7f3")
    .call(d3.axisBottom(x).tickFormat(d => formatNumber(d))) // Apply custom formatting function
    .call(g => g.append("text")
      .attr("x", bubbleChartWidth / 2 + 60)
      .attr("y", bubbleChartMargin.bottom - 2)
      .attr("fill", "#fff7f3")
      .attr("text-anchor", "end")
      .text("Total Vaccinations →"));


  // Add Y axis - Deaths per million
  const yAxis = bubbleChartSVG.append("g")
    .attr("class", "y-axis")
    .attr("color", "#fff7f3")
    .call(d3.axisLeft(y))
    .call(g => g.append("text")
      .attr("x", -bubbleChartMargin.left + 10)
      .attr("y", -15)
      .attr("fill", "#fff7f3")
      .attr("text-anchor", "start")
      .text("↑ Covid-19 Deaths Per Million"));

  // Add a scale for bubble size
  const z = d3.scaleLinear()
    .domain([0, 10000])
    .range([1, 40]);

  // Add dots
  const dots = bubbleChartSVG.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", d => `${d.iso_code}-gdp`)
    .attr("cx", function (d) { return x(d.total_vaccinations); })
    .attr("cy", function (d) { return y(d.total_deaths_per_million); })
    .attr("r", function (d) { return z(d.total_deaths_per_million); })
    .style("fill", "#fa9fb5")
    .style("opacity", "0.7")
    .attr("stroke", "#fff7f3")
    .on("mouseover", mouseOver)
    .on("mousemove", mouseMove)
    .on("mouseleave", mouseLeave)
    .on("click", mouseClick);

  // Define the zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.5, 5]) // Zoom in/out limits
    .on('zoom', zoomed);

  // Call the zoom behavior on the SVG container
  bubbleChartSVG.call(zoom);

  function zoomed(event) {
    const new_xScale = event.transform.rescaleX(x);
    const new_yScale = event.transform.rescaleY(y);

    // Update axes with custom formatting function
    xAxis.call(d3.axisBottom(new_xScale).tickFormat(d => formatNumber(d)));
    yAxis.call(d3.axisLeft(new_yScale));

    // Update dots position and size
    dots.attr("cx", function (d) { return new_xScale(d.total_vaccinations); })
      .attr("cy", function (d) { return new_yScale(d.total_deaths_per_million); })
      .attr("r", function (d) { return z(d.total_deaths_per_million) / Math.sqrt(event.transform.k); });
  }
}
