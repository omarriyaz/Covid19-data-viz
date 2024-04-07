// Load the CSV file from the 'data' folder
d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv").then(data => {
    // Filter data for the specific date '2024-02-29' and exclude Antarctica
    const filteredData = data.filter(d => d.date === '2022-04-20' && ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'].includes(d.continent));

    // Calculate the percentage of population vaccinated for each continent
    filteredData.forEach(d => {
        d.vaccinationRate = (d.people_vaccinated / d.population) * 100;
    });

    // Map the filtered data to the format expected by BarChart
    let chartData = filteredData.map(d => [d.continent, +d.vaccinationRate]);

    // Initialize the BarChart
    let Bar = new BarChart('div#bar-chart', 650, 433, [10, 50, 45, 20]);
    Bar.render(chartData);

    // Optionally, set custom labels
    Bar.setLabels('Continent →', '↑ % Population Vaccinated');

}).catch(error => {
    console.error('Error loading the CSV file:', error);
});

class BarChart {

    width;
    height;
    margin;
    svg;
    chart;
    bars;
    axisX;
    axisY;
    labelX;
    labelY;
    scaleX;
    scaleY;
    data;

    constructor(container, width, height, margin) {

        this.width = width;
        this.height = height;
        this.margin = margin;

        this.svg = d3.select(container).append('svg')
            .classed('barchart', true)
            .attr('width', this.width).attr('height', this.height);

        this.chart = this.svg.append('g')
            .attr('transform',
                `translate(${this.margin[2]},${this.margin[0]})`);
        this.bars = this.chart.selectAll('rect.bar');

        this.axisX = this.svg.append('g')
            .attr('transform',
                `translate(${this.margin[2]},${this.height - this.margin[1]})`)
            .attr('fill', '#fff7f3');

        this.axisY = this.svg.append('g')
            .attr('transform',
                `translate(${this.margin[2]},${this.margin[0]})`)
            .attr('fill', '#fff7f3');

        this.labelX = this.svg.append('text')
            .attr('transform', `translate(${this.width / 2},${this.height})`)
            .style('text-anchor', 'middle')
            .attr('dy', -10)
            .attr('fill', '#fff7f3')
            .style('font-size', '10px');

        this.labelY = this.svg.append('text')
            .attr('transform', `translate(0,${this.height / 2}) rotate(-90)`)
            .style('text-anchor', 'middle')
            .attr('dy', 15)
            .attr('fill', '#fff7f3')
            .style('font-size', '10px');
    }

    #updateScales() {
        let chartWidth = this.width - this.margin[2] - this.margin[3],
            chartHeight = this.height - this.margin[0] - this.margin[1];
        let rangeX = [0, chartWidth],
            rangeY = [chartHeight, 0];
        let domainX = this.data.map(d => d[0]),
            domainY = [0, d3.max(this.data, d => d[1])];
        this.scaleX = d3.scaleBand(domainX, rangeX).padding(0.2);
        this.scaleY = d3.scaleLinear(domainY, rangeY);
    }
    #updateAxes() {
        let axisGenX = d3.axisBottom(this.scaleX),
            axisGenY = d3.axisLeft(this.scaleY);
        this.axisX.call(axisGenX).attr('color', '#fff7f3');
        this.axisY.call(axisGenY).attr('color', '#fff7f3');
    }




    #updateBars() {

        // This line selects the tooltip div; ensure a div with the class 'tooltip' exists in your HTML.
        let tooltip = d3.select(".tooltipBAR")
            .style("display", "none")

        this.bars = this.bars
            .data(this.data, d => d[0])
            .join('rect')
            .classed('bar', true)
            .attr('x', d => this.scaleX(d[0]))
            .attr('height', d => this.scaleY(0) - this.scaleY(d[1]))
            .attr('width', this.scaleX.bandwidth())
            .attr('y', d => this.scaleY(d[1]))
            .attr('fill', '#fa9fb5')

            // Proper use of the tooltip variable within the mouse event handlers:
            .on("mouseover", function (event, d) {
                tooltip.style("opacity", 1)
                    .style("display", "block");
                const vaccinationRate = d[1].toFixed(2); // Format the vaccination rate to two decimal places
                tooltip.html(d[0] + "<br>" + "% Population Vaccinated: " + vaccinationRate)
                    .style("position", "fixed")
                    .style("left", (event.clientX + 5) + "px")
                    .style("top", (event.clientY - 20) + "px");
            })
            .on("mousemove", function (event, d) {
                tooltip.style("left", (event.clientX + 5) + "px")
                    .style("display", "block")
                    .style("top", (event.clientY - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0)
                    .style("display", "none");
            });
    }

    render(dataset) {
        this.data = dataset;
        this.#updateScales();
        this.#updateBars();
        this.#updateAxes();
        return this;
    }

    setLabels(labelX = 'categories', labelY = 'values') {
        this.labelX.text(labelX).attr('fill', '#fff7f3');
        this.labelY.text(labelY).attr('fill', '#fff7f3');
        return this;
    }
}
