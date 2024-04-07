// Setting dimensions of graph
const lineMargin = { top: 40, right: 40, bottom: 20, left: 90 };
const lineWidth = (Math.round(Number(mapSvg.style("width").slice(0, -2))) / 2) - lineMargin.left - lineMargin.right;
const lineHeight = (Math.round(Number(mapSvg.style("height").slice(0, -2))) / 2) - lineMargin.top - lineMargin.bottom + 30;

function lineGraph(data) {
  d3.select(".line-svg").remove();

  // Append the svg object to the body
  const lineSvg = d3
    .select("#line-viz")
    .append("svg")
    .attr("width", lineWidth + lineMargin.left + lineMargin.right)
    .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
    .attr("class", "line-svg")
    .append("g")
    .attr("transform", `translate(${lineMargin.left},${lineMargin.top})`);

  const timeStamps = data.map(d => d3.timeParse("%Y-%m-%d")(d.date));
  const domain = d3.extent(timeStamps);

  const x = d3.scaleTime().domain(domain).range([0, lineWidth]);

  // Adding the extra 10% for the top
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.new_people_vaccinated_smoothed + d.new_people_vaccinated_smoothed * 0.1)])
    .range([lineHeight, 0]);

  // Adding the axis and labels

  // X-axis
  lineSvg
    .append("g")
    .attr("transform", `translate(0, ${lineHeight})`)
    .attr("color", "#fff7f3")
    .call(d3.axisBottom(x)
      .ticks(d3.timeYear.every(1))
      .tickFormat(d3.timeFormat("%Y")))
    .call(g => g.append("text")
      .attr("x", lineWidth + 40)
      .attr("fill", "#fff7f3")
      .attr("y", lineMargin.bottom - 15)
      .attr("text-anchor", "end")
      .text("Date →"));

  // Y-axis
  lineSvg.append("g")
    .attr("color", "#fff7f3")
    .call(d3.axisLeft(y))
    .call(g => g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -lineHeight / 2)
      .attr("y", -90)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff7f3")
      .text("↑ Vaccinations"));


  // Get the data from the Covid-19 Dataset and create the lines
  const line = lineSvg
    .selectAll(".line")
    .data(d3.group(data, d => d.location))
    .join("path")
    .attr("fill", "none")
    .attr("stroke", "#fa9fb5")
    .attr("d", d => {
      return d3.line()
        .x(d => x(d3.timeParse("%Y-%m-%d")(d.date)))
        .y(d => y(+d.new_people_vaccinated_smoothed))
        (d[1])
    })
    .transition()
    .duration(1500)
    .ease(d3.easeSin)
    .attrTween("stroke-dasharray", function () {
      const len = this.getTotalLength();
      return function (t) {
        return d3.interpolateString(`0,${len}`, `${len},${len}`)(t);
      };
    });

  // Add the text at the bottom of the graph    
  lineSvg.append('text')
    .attr("x", lineWidth / 2 - 30)
    .attr("y", lineHeight - 290)
    .attr("text-anchor", "middle")
    .style("font-size", "1em")
    .style("font-weight", "bold")
    .style("stroke", "none")
    .style("fill", "#fff7f3")
    .text(() => {
      return "New People Vaccicated Daily for: " + data[0].location;

    })
}