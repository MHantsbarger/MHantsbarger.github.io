var data = [0.2, 0.4, 1.7, 4.3, 3.1, 3.3];

var xScale = d3.scaleLinear()
    .domain([0, 10])
    .range([50, window.innerWidth - 100]);

var colorScale = d3.scaleLinear()
    .domain([0, 5])
    .range(["green", "red"]);

var svg = d3.select("svg");

var circles = svg.selectAll("circle")
    .data(data);

circles.enter().append("circle")
    .attr("r", 10)
    .attr("fill", function(d) {
        return colorScale(d);
    })
    .attr("cx", function(d) {
        return xScale(d);
    })
    .attr("cy", 50);

d3.selectAll("circle")
    .on("click", function(d) {
        console.log(d);
    })
    .on("mousemove", function(d) {
        var mouse = d3.mouse(this);
        d3.select("#tooltip")
            .style("display", "block")
            .html("<h1>" + d + "</h1>")
            .style("left", mouse[0] + "px")
            .style("top", mouse[1] - 50 + "px");
    })
    .on("mouseout", function(d) {
        d3.select("#tooltip")
            .style("display", "none")
    });

var axis = d3.axisBottom(xScale);
d3.select("#xAxis").call(axis);