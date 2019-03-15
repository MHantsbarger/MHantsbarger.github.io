// data obtained from https://www.kaggle.com/gregorut/videogamesales#vgsales.csv
d3.csv("/data/Final_Project_Data/vgsales.csv", function(error, data) { //load and handle data
    console.log("csv data error:", error);
    console.log("csv contents:", data);

    // parse data into variables
    data.forEach( 
        function(d){ 
            d.rank = parseInt(d.Rank); // Sales rank
            d.name = d.Name; // Name of game
            d.platform = d.Platform; // Release platform for the game
            d.year = parseInt(d.Year); // Year of release (Since 1980 to 2016)
            d.genre = d.Genre; // Game genre
            d.publisher = d.Publisher; // Company which released the game
            d.salesNA = parseFloat(d.EU_Sales) * 1000000; // European sales
            d.salesJPN = parseFloat(d.JP_Sales) * 1000000; // Japan sales
            d.salesOther = parseFloat(d.Other_Sales) * 1000000; // Sales in other countries
            d.salesTotal = parseFloat(d.Global_Sales) * 1000000; // Global Sales
            // console.log(d);
        }
    );

    var graphScales;
    // set up scale for top 50 games
    graphScales = setScale(
        [1,51], [350, .97*window.innerWidth],
        [0, 90000000], [560, 120]);
    var xScale = graphScales[0];
    var yScale = graphScales[1];
    
    var svg = d3.select("svg");

    // load in top 50 games
    var filteredData = filterRank(data,1,50);
    //console.log(filteredData);


    var barGrBars = svg.selectAll("barRect")
        .data(filteredData);

    barGrBars.enter().append("rect")
        .attr("id", "barRect")
        .attr("x", function(d) {
            return xScale(d.rank);
        })
        .attr("y", function(d) {
            return yScale(d.salesTotal);
        })
        .attr("width", function(d) {
            return ((window.innerWidth-270)/50)-3;
        })
        .attr("height", function(d) {
            return 560-(yScale(d.salesTotal));
        })
        .attr("fill", function(d) {
            // return "grey";
            // if (d.rank%2 == 0) {
            //     return "lightgray";
            // }
            // else {
            //     return "grey";
            // }
        });
    
    var series = createStackedGraph(filteredData);
    console.log (series);

    mouseOverTooltips(filteredData);

    var axis = d3.axisLeft(yScale);
    d3.select("#yAxis").call(axis);
});


// function that takes in x and y scales for main bar graph and returns d3.scalelinear for both in a 2 element array.
function setScale([dXmin, dXmax], [rXmin, rXmax], [dYmin, dYmax], [rYmin, rYmax]) {
    var xScale = d3.scaleLinear()
        .domain([dXmin, dXmax])
        .range([rXmin, rXmax]);

    var yScale = d3.scaleLinear()
        .domain([dYmin, dYmax])
        .range([rYmin, rYmax]);
    return [xScale, yScale];
}

// function that filters data based on min and max rank, inclusive.
function filterRank(data, rankMin, rankMax) {
    var rankRange = data.filter(function(d){
        return d.rank <= rankMax && d.rank >= rankMin;
    });
    return rankRange;
}

// function that handles mouseover events to display tooltips.
function mouseOverTooltips(data) {
    d3.selectAll("#barRect")
        .data(data)
        .on("click", function(d) {
            console.log(d.name);
        })
        .on("mousemove", function(d) {
            var mouse = d3.mouse(this);
            d3.select("#tooltip")
                .style("display", "block")
                .html("<h3>" + d.name + "</h3>")
                .style("left", mouse[0] + 50 + "px")
                .style("top", mouse[1] - 50 + "px");
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip")
                .style("display", "none")
        });
}

// function that creates a stacked data based on sales per region (NA, JPN, and Other)
function createStackedGraph(data) {
    var stack = d3.stack(data)
        .keys(["salesJPN", "salesNA", "salesOther"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    
    var series = stack(data);
    return series;
}