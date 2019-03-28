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
            d.salesNA = parseFloat(d.NA_Sales) * 1000000; // NA sales
            d.salesEU = parseFloat(d.EU_Sales) * 1000000; // EU sales
            d.salesJPN = parseFloat(d.JP_Sales) * 1000000; // Japan sales
            d.salesOther = parseFloat(d.Other_Sales) * 1000000; // Sales in other countries
            d.salesTotal = parseFloat(d.Global_Sales) * 1000000; // Global Sales
            // console.log(d);
        }
    );
    

    // load in top 50 games
    var filteredData = filterRank(data,1,50);
    //console.log(filteredData);

    var graphDimensions = updateFrameDimensions();
    // console.log(graphDimensions);
    
    var graphScales;
    // set up scale for top 50 games
    graphScales = setScale(
        [1,51], [350, 350 + graphDimensions.graphZoneWidth],
        [0, 90000000], [graphDimensions.graphZoneHeight + 140, 140]);
    var xScale = graphScales[0];
    var yScale = graphScales[1];
    
    var series = createStackedGraph(filteredData);
    // console.log (series);

    filteredData.forEach(
        function(d,i) {
            d.JPNrect = series[0][i];
            d.NArect = series[1][i];
            d.EUrect = series[2][i];
            d.Otherrect = series[3][i];
        }
    );
    // console.log(filteredData);

    // var barGrBars = svg.selectAll("barRect")
    // .data(filteredData);

    var svg = d3.select("svg");

    var JPNbarGraph = drawRegionBars("JPN", filteredData, graphDimensions, xScale, yScale);

    var NAbarGraph = drawRegionBars("NA", filteredData, graphDimensions, xScale, yScale);

    var EUbarGraph = drawRegionBars("EU", filteredData, graphDimensions, xScale, yScale);

    var OtherbarGraph = drawRegionBars("Other", filteredData, graphDimensions, xScale, yScale);
    
    var axis = d3.axisLeft(yScale);
    axis.tickFormat(d3.format("(.2s"));
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

// function that sets width and height of frame
function updateFrameDimensions() {
    screenHeight = window.innerHeight;
    screenWidth = window.innerWidth;

    frameHeight = screenHeight - 140;
    frameWidth = screenWidth - 40;

    sidebarHeight = frameHeight - 40;
    sidebarWidth = 250;

    graphZoneHeight = sidebarHeight;
    graphZoneWidth = frameWidth - 350;

    var svg = d3.select("svg");
    var frameRect = svg.selectAll(".framerect");
    frameRect
        .attr("class", "framerect")
        .attr("x", 20)
        .attr("y", 120)
        .attr("width", frameWidth)
        .attr("height", frameHeight);

    var sidebarRect = svg.selectAll(".sidebarrect");
    sidebarRect
        .attr("class", "sidebarrect")
        .attr("x", 40)
        .attr("y", 140)
        .attr("width", sidebarWidth)
        .attr("height", sidebarHeight);

    return {graphZoneWidth, graphZoneHeight};
}

// function that filters data based on min and max rank, inclusive.
function filterRank(data, rankMin, rankMax) {
    var rankRange = data.filter(function(d){
        return d.rank <= rankMax && d.rank >= rankMin;
    });
    return rankRange;
}

// function that creates a stacked data based on sales per region (NA, JPN, and Other)
function createStackedGraph(data) {
    var stack = d3.stack(data)
        .keys(["salesJPN", "salesNA", "salesEU", "salesOther"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    
    var series = stack(data);
    return series;
}

// function that draws bars for a certain region
function drawRegionBars(region, data, graphDimensions, xScale, yScale) {
    var svg = d3.select("svg");
    var barGrBars = svg.selectAll("#"+ region)
        .data(data);

    var barEnter = barGrBars.enter().append("rect")
        .attr("id", region)
        .attr("class", "barRect")
        .attr("x", function(d) {
            return xScale(d.rank);
        })
        .attr("y", function(d) {
            if (region == "JPN") {yVar = d.JPNrect[1]; }
            else if (region == "NA") {yVar = d.NArect[1];}
            else if (region == "EU") {yVar = d.EUrect[1];}
            else { yVar = d.Otherrect[1];}
            return yScale(yVar);
        })
        .attr("width", function(d) {
            return (graphDimensions.graphZoneWidth/50);
        })
        .attr("height", function(d) {
            if (region == "JPN") {heightVar = d.JPNrect[1]-d.JPNrect[0];}
            else if (region == "NA") {heightVar = d.NArect[1]-d.NArect[0];}
            else if (region == "EU") {heightVar = d.EUrect[1]-d.EUrect[0];}
            else {heightVar = d.Otherrect[1]-d.Otherrect[0];}
            return graphDimensions.graphZoneHeight + 140 -(yScale(heightVar));
        })
        .attr("fill", function(d) {
            if (region == "JPN") {color = "red";}
            else if (region == "NA") {color = "blue";}
            else if (region == "EU") {color = "orange";}
            else {color = "green";}
            return color;
        });
    barGrBars.merge(barEnter) //tooltip functionality
        .on("click", function(d) {
            console.log(d.name);
        })
        .on("mousemove", function(d) {
            var mouse = d3.mouse(this);
            d3.select("#tooltip")
                .style("display", "block")
                .html("<h3>" + d.name + "</h3><h4>" 
                        + d.platform + "<br/>"
                        + d3.format("(.3s")(d["sales" + region])+ " sales</h4>") //only JPN sales until i figure out how to get tooltips for other bars
                .style("left", mouse[0] - 140 + "px")
                .style("top", mouse[1] - 130 + "px");
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip")
                .style("display", "none")
        });
    return barGrBars;
}




