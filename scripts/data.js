// store data globally to be used by other graphs
let mainData;

// Read data from repo
d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv").then(data => {

    // Filter the data on latest updated date without blanks.
    bubbleData = data.filter(d => d.date === "2022-04-20" && d.continent !== '' && d.location !== '');
    mainData = data;
    yearDates = data.filter(d => ((d.location === "World") && (d.date === "2020-12-31" || d.date === "2021-12-31" || d.date === "2022-04-20" || d.date === "2023-04-13" || d.date === "2024-02-29")));

    // Color palette for continents
    const color = d3.scaleOrdinal()
        .domain(["North America", "South America", "Europe", "Africa", "Asia", "Oceania"])
        .range(d3.schemeSet1);

    // call line chart and bubble chart using the data from csv
    lineGraph(data.filter(d => d.location === 'World'));
    bubbleChart(bubbleData);
    pieChart(yearDates);
});
