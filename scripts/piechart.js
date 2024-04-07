const pieChart = (data) => {

    // set the dimensions and margin of the graph
    const pieMargin = 30;
    const pieWidth = (Math.round(Number(mapSvg.style("width").slice(0, -2))) / 2);
    const pieHeight = (Math.round(Number(mapSvg.style("height").slice(0, -2))) / 2) - pieMargin;


    // The radius of the pieplot is half the width or half the height (smallest one).
    const radius = Math.min(pieWidth, pieHeight) / 2 - pieMargin
    console.log(data);
    const pieDataObjects = data.map((d, i) => {
        const date = d.date;
        let totalCasesPerMillion;
        if (date === "2020-12-31") {
            totalCasesPerMillion = d.total_cases_per_million;
        } else {
            const previousDate = data[i - 1].date;
            const previousTotalCasesPerMillion = data.find(entry => entry.date === previousDate).total_cases_per_million;
            totalCasesPerMillion = d.total_cases_per_million - previousTotalCasesPerMillion;
        }
        return { [date]: totalCasesPerMillion };
    });

    const pieData = Object.assign({}, ...pieDataObjects);

    // append the svg object
    const pieSVG = d3.select("#pie-viz")
        .append("svg")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

    const pieTooltip = d3.select("#pie-viz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "pie-tooltip")
        .style("display", "none")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "0.3em");

    const mouseOver = (event, d) => {
        pieTooltip.style("opacity", 1)
            .style("display", "block");

    }

    const mouseMove = (event, d) => {
        pieTooltip
            .html('<u>' + d.data[0].slice(0, 4) + '</u>' + "<br>" + parseInt(d.data[1]) + " Total cases")
            .style("position", "fixed")
            .style("display", "block")
            .style("left", (event.x + 15) + "px")
            .style("top", (event.y) + "px");
    };

    const mouseLeave = (event, d) => {
        pieTooltip.style("opacity", 0)
            .style("display", "none");
    }

    const onClick = (event, d) => {
        const clickedDate = d.data[0];
        clickedYear = clickedDate.slice(0, 4);
        selectYear(clickedYear);
    };

    // set the color scale  
    const color = d3.scaleOrdinal(['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1']);

    // Compute the position of each group on the pie:
    const pie = d3.pie()
        .value(function (d) { return d[1] });

    const computed_data = pie(Object.entries(pieData));

    // Set the inner radius to create a hole in the middle, making it a donut chart
    const innerRadius = radius * 0.5;

    // Shape helper to build arcs with inner and outer radius:
    const arcGenerator = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    // pie chart; generate arcs using arcGenerator method.
    pieSVG
        .selectAll('arc')
        .data(computed_data)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => { return (color(i)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("mousemove", mouseMove)
        .on("click", onClick);

    // Append labels to the pie chart
    pieSVG.selectAll("text")
        .data(computed_data)
        .enter()
        .append("text")
        .text((d) => d.data[0].slice(2, 4)) // Extract year last two 
        .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "8px")
        .style("fill", "black");
}