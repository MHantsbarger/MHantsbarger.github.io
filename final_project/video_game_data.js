// global variables
var consoleMap;
var realConsoleMap;
var globalData; //whole dataset
var filteredData; //filtered dataset for graph
var graphDimensions;
// var rankMin = document.querySelector('#rankmin').value;
var numDisp = document.querySelector('#numdisp').value;
var numDispPrev = numDisp;

var xScale;
var xScaleOld;
var yScale;
var yScaleOld;
var maxYval;
var themeID;
changeTheme();

// data obtained from https://www.kaggle.com/gregorut/videogamesales#vgsales.csv
d3.queue() //load and handle data
    .defer(d3.csv,"/data/Final_Project_Data/vgsales.csv")
    .defer(d3.csv,"/data/Final_Project_Data/ConsoleNameAbbrvMap.csv")
    .awaitAll(function(error,dataArray) {
        var data = dataArray[0];
        consoleMap = dataArray[1];
        realConsoleMap = consoleMap.reduce(function(map, obj) {
            map[obj.Acronym] = obj.Name;
            return map;
        }, {});
        // console.log(realConsoleMap);

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
    dropdownFill(data);
    globalData = data;
    filteredData = globalData;

    graphDimensions = updateFrameDimensions();
    var graphScales = setScale(
        [1,(parseInt(numDisp)+1)], [350, 350 + graphDimensions.graphZoneWidth],
        [0, 90000000], [graphDimensions.graphZoneHeight + 140, 140]);
    xScale = graphScales[0];
    xScaleOld = xScale;
    yScale = graphScales[1];
    yScaleOld = yScale;

    update();

});

// function that populates publisher, genre, and console dropdowns
function dropdownFill(data) {
    // publisher
    var publisherList = d3.nest()
    .key(function(d) {
        return d.publisher;
    })
    .entries(data);
    // only show top 100 publishers
    var cutPubList = publisherList.filter(function(d,i){
        return i < publisherList.length+1;
    });
    // sort by name alphabetically
    var sortCutPubList = cutPubList.sort(function(a, b){
        if (a.key > b.key) {
            return 1;
        }
        if (b.key < a.key) {
            return -1;
        }
        return 0;
    });
    // populate dropdown
    var pubDropdown = document.getElementById("publisherDropdown");
    for (i=0;i<sortCutPubList.length;i++) {
        var opt = sortCutPubList[i].key;
        var el = document.createElement("option");
        el.textContent = String(opt);
        el.value = String(opt);
        pubDropdown.appendChild(el);
    }

    // console
    var consoleList = d3.nest()
    .key(function(d) {
        return d.platform;
    })
    .entries(data);
    //use consoleMap to correspond to name
    var sortConsList = consoleList.sort(function(a, b){
        if (a.key > b.key) {
            return 1;
        }
        if (b.key < a.key) {
            return -1;
        }
        return 0;
    });
    // populate dropdown
    var consoleDropdown = document.getElementById("consoleDropdown");
    for (i=0;i<sortConsList.length;i++) {
        var opt = sortConsList[i].key;
        var el = document.createElement("option");
        // el.textContent = String(opt);
        // console.log(realConsoleMap[opt]);
        el.textContent = realConsoleMap[opt];
        el.value = String(opt);
        consoleDropdown.appendChild(el);
    }

    // genre
    var genreList = d3.nest()
    .key(function(d) {
        return d.genre;
    })
    .entries(data);
    // sort by name alphabetically
    var sortGenList = genreList.sort(function(a, b){
        if (a.key > b.key) {
            return 1;
        }
        if (b.key < a.key) {
            return -1;
        }
        return 0;
    });
    // populate dropdown
    var genreDropdown = document.getElementById("genreDropdown");
    for (i=0;i<sortGenList.length;i++) {
        var opt = sortGenList[i].key;
        var el = document.createElement("option");
        el.textContent = String(opt);
        el.value = String(opt);
        genreDropdown.appendChild(el);
    }
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

//function that runs all filters and draws graph
function update() {
    graphDimensions = updateFrameDimensions();
    filteredData = globalData;
    
    // rankMin = document.querySelector('#rankmin').value;
    numDispPrev = numDisp; //holds previous rank for animation transition
    numDisp = document.querySelector('#numdisp').value;
    if (numDisp > 200) { // only shows 200 bars at a time
        numDisp = 200;
    }
    else if (numDisp < 1) {
        numDisp = 1;
    }

    //filtering data functions
    filteredData = filterYear(document.querySelector('#yearmin').value,document.querySelector('#yearmax').value);
    filteredData = filterPublisher(document.querySelector('#publisherDropdown'));
    filteredData = filterGenre(document.querySelector('#genreDropdown'));
    filteredData = filterConsole(document.querySelector('#consoleDropdown'));
    filterRegion();
    filteredData = filterRank();
    
    // set up scale
    maxYval = (filteredData[0].salesTotal) * 1.05;
    var graphScales = setScale(
        [1,(parseInt(filteredData.length)+1)], [350, 350 + graphDimensions.graphZoneWidth],
        [0, maxYval], [graphDimensions.graphZoneHeight + 140, 140]);
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

// function that filters data based on publisher.
function filterPublisher(Publisher) {
    publisherName = Publisher.options[Publisher.selectedIndex].value;
    if (publisherName == "AllPublishers") {
        // console.log("showing all");
        return filteredData;
    }
    else {
        // console.log("filtering publishers");
        var pubData = filteredData.filter(function(d){
            return d.publisher == publisherName;
        });
        return pubData;
    } 
}

// function that filters data based on console.
function filterConsole(Console) {
    consoleName = Console.options[Console.selectedIndex].value;
    console.log(consoleName);
    if (consoleName == "AllConsoles") {
        // console.log("showing all");
        return filteredData;
    }
    else {
        // console.log("filtering console");
        var consData = filteredData.filter(function(d){
            return d.platform == consoleName;
        });
        return consData;
    }
}

// function that filters data based on genre.
function filterGenre(Genre) {
    genreName = Genre.options[Genre.selectedIndex].value;
    if (genreName == "AllGenres") {
        // console.log("showing all");
        return filteredData;
    }
    else {
        // console.log("filtering genre");
        var genreData = filteredData.filter(function(d){
            return d.genre == genreName;
        });
        return genreData;
    }
    
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
        d.salesTotal = parseInt(d.salesJPN) + parseInt(d.salesNA) + parseInt(d.salesEU) + parseInt(d.salesOther);
    });
}

// function that filters data based on min and max rank, inclusive.
function filterRank() {

    // sort by d.salesTotal, highest to lowest
    var sortedData = filteredData.sort(function(a,b){
        return parseInt(b.salesTotal) - parseInt(a.salesTotal);
    });
    //console.log(sortedData);

    var rankData = sortedData.filter(function(d,i){
        return i < parseInt(numDisp);
    });
    return rankData;
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
    var barGrBars = svg.selectAll("."+ region)
        .data(filteredData,function(d){
            return d.rank+region; //keep id of each box based on total rank and region for smooth transition
        });
    var barEnter = barGrBars.enter().append("rect")
        // .attr("id", region)
        .attr("class", region)
        .attr("x", function(d,i) {
            return xScaleOld(parseInt(i)+1);
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
            return (graphDimensions.graphZoneWidth/numDispPrev);
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
        })
        .attr("stroke","grey")
        .attr("stroke-width","1px");
    barGrBars.merge(barEnter) 
        .on("click", function(d) {
            console.log(d.name);
        })
        .on("mousemove", function(d) { //tooltip functionality
            var mouse = d3.mouse(this);
            d3.select("#tooltip")
                .style("display", "block")
                .html("<div id='tooltipTitle'>" + d.name + "</div><div id='tooltipText'>" 
                        + "Publisher: " + d.publisher + "<br/>"
                        + "Platform: " + d.platform + "<br/>"
                        + "Genre: " + d.genre + "<br/>"
                        + d3.format("(.3s")(d["sales" + region])+ " " + region +" Sales<br/>"
                        + d3.format("(.3s")(d["salesTotal"])+ " " + " Global Sales</div>")
                .style("left", mouse[0] - 210 + "px")
                .style("top", mouse[1] - 120 + "px");
        })
        .on("mouseout", function(d) { //hide tooltip
            d3.select("#tooltip")
                .style("display", "none")
        })
        .transition().duration(2000)
            .attr("x", function(d,i) {
                return xScale(parseInt(i)+1);
            })
            .attr("y", function(d) {
                if (region == "JPN") {yVar = d.JPNrect[1]; }
                else if (region == "NA") {yVar = d.NArect[1];}
                else if (region == "EU") {yVar = d.EUrect[1];}
                else { yVar = d.Otherrect[1];}
                return yScale(yVar);
            })
            .attr("width", function(d) {
                return (graphDimensions.graphZoneWidth/numDisp);
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
            })
            .attr("stroke","grey")
            .attr("stroke-width","1px");
    barGrBars.exit()
        .transition().duration(1500)
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

function changeTheme() {
    // console.log("It's alive!!!");
    themeID = document.querySelector('#themeSelect').value;
    d3.select("body").attr("class", themeID);
}