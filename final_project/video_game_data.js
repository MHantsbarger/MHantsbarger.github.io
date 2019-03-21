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
    var svg = d3.select("svg");

    var graphDimensions = updateFrameDimensions();
    console.log(graphDimensions);

    var graphScales;
    // set up scale for top 50 games
    graphScales = setScale(
        [1,51], [350, .97*window.innerWidth],
        [0, 90000000], [560, 120]);
    var xScale = graphScales[0];
    var yScale = graphScales[1];
    
    

    // load in top 50 games
    var filteredData = filterRank(data,1,50);
    //console.log(filteredData);


    // var barGrBars = svg.selectAll("barRect")
    //     .data(filteredData);

    // barGrBars.enter().append("rect")
    //     .attr("id", "barRect")
    //     .attr("x", function(d) {
    //         return xScale(d.rank);
    //     })
    //     .attr("y", function(d) {
    //         return yScale(d.salesTotal);
    //     })
    //     .attr("width", function(d) {
    //         return ((window.innerWidth-270)/50)-3;
    //     })
    //     .attr("height", function(d) {
    //         return 560-(yScale(d.salesTotal));
    //     })
    //     .attr("fill", function(d) {
    //         // return "grey";
    //         // if (d.rank%2 == 0) {
    //         //     return "lightgray";
    //         // }
    //         // else {
    //         //     return "grey";
    //         // }
    //     });
    
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

    var barGrBars = svg.selectAll("barRect")
    .data(filteredData);

    // JPN data
    barGrBars.enter().append("rect")
        .attr("id", "barRect")
        .attr("x", function(d) {
            return xScale(d.rank);
        })
        .attr("y", function(d) {
            // console.log(d.JPNrect[1]);
            return yScale(d.JPNrect[1]);
        })
        .attr("width", function(d) {
            return ((window.innerWidth-270)/50)-3;
        })
        .attr("height", function(d) {
            // console.log(d.JPNrect[1]-d.JPNrect[0]);
            return 560-(yScale(d.JPNrect[1]-d.JPNrect[0]));
        })
        .attr("fill", function(d) {
            return "red";
        });

    // NA data
    barGrBars.enter().append("rect")
        .attr("id", "barRect")
        .attr("x", function(d) {
            return xScale(d.rank);
        })
        .attr("y", function(d) {
            // console.log(d.NArect[1]);
            return yScale(d.NArect[1]);
        })
        .attr("width", function(d) {
            return ((window.innerWidth-270)/50)-3;
        })
        .attr("height", function(d) {
            // console.log(d.NArect[1]-d.NArect[0]);
            return 560-(yScale(d.NArect[1]-d.NArect[0]));
        })
        .attr("fill", function(d) {
            return "blue";
        });

    // EU data
    barGrBars.enter().append("rect")
        .attr("id", "barRect")
        .attr("x", function(d) {
            return xScale(d.rank);
        })
        .attr("y", function(d) {
            // console.log(d.EUrect[1]);
            return yScale(d.EUrect[1]);
        })
        .attr("width", function(d) {
            return ((window.innerWidth-270)/50)-3;
        })
        .attr("height", function(d) {
            // console.log(d.EUrect[1]-d.EUrect[0]);
            return 560-(yScale(d.EUrect[1]-d.EUrect[0]));
        })
        .attr("fill", function(d) {
            return "orange";
        });
    
    // Other data
    barGrBars.enter().append("rect")
        .attr("id", "barRect")
        .attr("x", function(d) {
            return xScale(d.rank);
        })
        .attr("y", function(d) {
            // console.log(d.Otherrect[1]);
            return yScale(d.Otherrect[1]);
        })
        .attr("width", function(d) {
            return ((window.innerWidth-270)/50)-3;
        })
        .attr("height", function(d) {
            // console.log(d.Otherrect[1]-d.Otherrect[0]);
            return 560-(yScale(d.Otherrect[1]-d.Otherrect[0]));
        })
        .attr("fill", function(d) {
            return "green";
        });

    // var barGrBars = svg.selectAll("barRect")
        // .data(filteredData);
    // why does tooltip only show for JPN games?
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
                .html("<h3>" + d.name + "<br/>" + d3.format("($.3s")(d.salesJPN)+ "</h3>") //only JPN sales until i figure out how to get tooltips for other bars
                .style("left", mouse[0] - 200 + "px")
                .style("top", mouse[1] - 90 + "px");
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip")
                .style("display", "none")
        });
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

// function that sets width and height of frame
function updateFrameDimensions() {
    screenHeight = window.innerHeight;
    screenWidth = window.innerWidth;

    frameHeight = screenHeight - 140;
    frameWidth = screenWidth - 40;

    sidebarHeight = frameHeight - 40;
    sidebarWidth = 250;

    graphZoneHeight = sidebarHeight;
    graphZoneWidth = frameWidth - 270;

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