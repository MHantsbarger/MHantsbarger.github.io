// global variables
var globalData; //whole dataset
var filteredData; //filtered dataset for graph
var graphDimensions;
var rankMin = document.querySelector('#rankmin').value;
var rankMax = document.querySelector('#rankmax').value;
var rankRange = rankMax - rankMin +1
var rankRangePrev = rankRange;
var xScale;
var xScaleOld;
var yScale;
var yScaleOld;

// data obtained from https://www.kaggle.com/gregorut/videogamesales#vgsales.csv
d3.queue() //load and handle data
    .defer(d3.csv,"/data/Final_Project_Data/vgsales.csv")
    .defer(d3.csv,"/data/Final_Project_Data/ConsoleNameAbbrvMap.csv")
    .awaitAll(function(error,dataArray) {
        var data = dataArray[0];
        var consoleMap = dataArray[1];
// d3.csv("/data/Final_Project_Data/vgsales.csv", function(error, data) { //old way to load and handle data
//     console.log("csv data error:", error);
    // console.log("csv contents:", data);

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
    globalData = data;
    filteredData = globalData;

    // var publisherList = d3.nest()
    // .key(function(d) {
    //     return d.publisher;
    // })
    // .entries(data);
    // console.log("publisher list:");
    // console.log(publisherList);

    // var consoleList = d3.nest()
    // .key(function(d) {
    //     return d.platform;
    // })
    // .entries(data);
    // console.log("console list:");
    // console.log(consoleList);

    graphDimensions = updateFrameDimensions();
    var graphScales = setScale(
        [rankMin,(parseInt(rankMax)+1)], [350, 350 + graphDimensions.graphZoneWidth],
        [0, 90000000], [graphDimensions.graphZoneHeight + 140, 140]);
    xScale = graphScales[0];
    xScaleOld = xScale;
    yScale = graphScales[1];
    yScaleOld = yScale;

    update();

});

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

//function that runs all filters and draws graph
function update() {
    graphDimensions = updateFrameDimensions();
    filteredData = globalData;
    
    //setting up rank values
    rankMin = document.querySelector('#rankmin').value;
    rankMax = document.querySelector('#rankmax').value;
    rankRangePrev = rankRange; //holds previous rank for animation transition
    rankRange = parseInt(rankMax) - parseInt(rankMin) + 1;
    if (rankRange > document.querySelector('#gamemax').value) { //limits rank range based on max display value
        rankRange = document.querySelector('#gamemax').value;
        rankMax = parseInt(rankRange) + parseInt(rankMin) - 1;
    }

    //filtering data functions
    filteredData = filterYear(document.querySelector('#yearmin').value,document.querySelector('#yearmax').value);
    filteredData = filterRank(rankMin, rankMax);
    filterRegion();
    filteredData = limitEntries();
    
    // set up scale
    var graphScales = setScale(
        [rankMin,(parseInt(rankMax)+1)], [350, 350 + graphDimensions.graphZoneWidth],
        [0, 90000000], [graphDimensions.graphZoneHeight + 140, 140]);
    xScaleOld = xScale;
    xScale = graphScales[0];
    yScaleOld = yScale;
    yScale = graphScales[1];
    
    var series = createStackedGraph();
    // console.log (series);
    
    filteredData.forEach(
        function(d,i) { 
            d.JPNrect = series[0][i];
            d.NArect = series[1][i];
            d.EUrect = series[2][i];
            d.Otherrect = series[3][i];
        }
    );

    var svg = d3.select("svg");

    var JPNbarGraph = drawRegionBars("JPN");
    
    var NAbarGraph = drawRegionBars("NA");

    var EUbarGraph = drawRegionBars("EU");

    var OtherbarGraph = drawRegionBars("Other");
    
    var axis = d3.axisLeft(yScale);
    axis.tickFormat(d3.format("(.2s"));
    d3.select("#yAxis").call(axis);
}

// function that filters data based on year, inclusive.
function filterYear(yearMin,yearMax) {
    if (yearMin == 1980 && yearMax == 2016) { //if filter includes all years, avoid filtering so that games with unknown years are included
        return filteredData;
    }
    else {
        var yearData = filteredData.filter(function(d){
            return d.year <= yearMax && d.year >= yearMin;
        });
        return yearData;
    }
}

// function that filters data based on min and max rank, inclusive.
function filterRank(rankMin, rankMax) {
    var rankData = filteredData.filter(function(d){
        return d.rank <= rankMax && d.rank >= rankMin;
    });
    return rankData;
}

// function that filters data based on publisher.
function filterPublisher(Publisher) {
    var pubData = filteredData.filter(function(d){
        return d.publisher == Publisher;
    });
    return pubData;
}

// function that filters data based on region
function filterRegion() {
    filteredData.forEach(function(d){
        if (document.querySelector('#jpnToggle').checked == false) {
            d.salesJPN = 0;
        }
        else {
            d.salesJPN = parseFloat(d.JP_Sales) * 1000000;
        }
        if (document.querySelector('#naToggle').checked == false) {
            d.salesNA = 0;
        }
        else {
            d.salesNA = parseFloat(d.NA_Sales) * 1000000;
        }
        if (document.querySelector('#euToggle').checked == false) {
            d.salesEU = 0;
        }
        else {
            d.salesEU = parseFloat(d.EU_Sales) * 1000000;
        }
        if (document.querySelector('#otherToggle').checked == false) {
            d.salesOther = 0;
        }
        else {
            d.salesOther = parseFloat(d.Other_Sales) * 1000000;
        }
    });
}

//function that limits number of shown entries
function limitEntries() {
    var limitData = filteredData.filter(function(d,i){
        return i < document.querySelector('#gamemax').value;
    });
    return limitData;
}

// function that takes in x and y scales for main bar graph and returns d3.scalelinear for both in a 2 element array.
function setScale([dXmin, dXmax], [rXmin, rXmax], [dYmin, dYmax], [rYmin, rYmax]) {
    var setxScale = d3.scaleLinear()
        .domain([dXmin, dXmax])
        .range([rXmin, rXmax]);

    var setyScale = d3.scaleLinear()
        .domain([dYmin, dYmax])
        .range([rYmin, rYmax]);
    return [setxScale, setyScale];
}

// function that creates a stacked data based on sales per region (NA, JPN, and Other)
function createStackedGraph() {
    var stack = d3.stack(filteredData)
        .keys(["salesJPN", "salesNA", "salesEU", "salesOther"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    
    var series = stack(filteredData);
    return series;
}

// function that draws bars for a certain region
function drawRegionBars(region) {
    var svg = d3.select("svg");
    var barGrBars = svg.selectAll("#"+ region)
        .data(filteredData);
    var barEnter = barGrBars.enter().append("rect")
        .attr("id", region)
        .attr("class", "barRect")
        .attr("x", function(d) {
            return xScaleOld(d.rank);
        })
        .attr("y", function(d) {
            // return yScale(1);
            if (region == "JPN") {yVar = d.JPNrect[0]/4; }
            else if (region == "NA") {yVar = d.NArect[0]/4;}
            else if (region == "EU") {yVar = d.EUrect[0]/4;}
            else { yVar = d.Otherrect[0]/4;}
            return yScaleOld(yVar);
        })
        .attr("width", function(d) {
            return (graphDimensions.graphZoneWidth/rankRangePrev);
        })
        .attr("height", function(d) {
            return 0;
        })
        .attr("fill", function(d) {
            if (region == "JPN") {color = "red";}
            else if (region == "NA") {color = "blue";}
            else if (region == "EU") {color = "orange";}
            else {color = "green";}
            return color;
        });
    barGrBars.merge(barEnter) 
        .on("click", function(d) {
            console.log(d.name);
        })
        .on("mousemove", function(d) { //tooltip functionality
            var mouse = d3.mouse(this);
            d3.select("#tooltip")
                .style("display", "block")
                .html("<h4>" + d.name + "</h4><h5>" 
                        + d.platform + "<br/>"
                        + d3.format("(.3s")(d["sales" + region])+ " sales</h5>")
                .style("left", mouse[0] - 140 + "px")
                .style("top", mouse[1] - 130 + "px");
        })
        .on("mouseout", function(d) { //hide tooltip
            d3.select("#tooltip")
                .style("display", "none")
        })
        .transition().duration(1500)
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
                return (graphDimensions.graphZoneWidth/rankRange);
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
    barGrBars.exit()
        .transition().duration(1000)
            .attr("y", function(d) {
                // return yScale(1);
                if (region == "JPN") {yVar = d.JPNrect[0]; }
                else if (region == "NA") {yVar = d.NArect[0];}
                else if (region == "EU") {yVar = d.EUrect[0];}
                else { yVar = d.Otherrect[0];}
                return yScale(yVar);
            })
            
            .attr("height", function(d) {
                return 0;
            })
            .remove();
    var barGrBars = svg.selectAll("#"+ region);
    return barGrBars;
}
