// data obtained from https://www.kaggle.com/gregorut/videogamesales#vgsales.csv
d3.csv("/data/Final_Project_Data/vgsales.csv", function(error, data) { //load and handle data
    console.log("csv data error:", error);
    console.log("csv contents:", data);

    //parse data into variables
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
    
    var xScale = d3.scaleLinear()
    .domain([1,11])
    .range([350, .97*window.innerWidth]);

    var yScale = d3.scaleLinear()
        .domain([0, 90000000])
        .range([120, 460]);


    var svg = d3.select("svg");
    // var bgRect = svg.selectAll("#bgRect")
    // x="5px" y="100px" width="98%" height="500px" fill="white" stroke-width="1" stroke="black"
    var topTen = data.filter(function(d){
        return d.rank <= 10;
    });
    console.log(topTen);

    var barGrBars = svg.selectAll("barRect")
        .data(topTen);

    barGrBars.enter().append("rect")
        .attr("id", "barRect")
        .attr("x", function(d) {
            return xScale(d.rank);
        })
        .attr("y", function(d) {
            // return yScale(d.salesTotal);
            return 120;
        })
        .attr("width", function(d) {
            return ((window.innerWidth-270)/10)-35;
            // return 20;
        })
        .attr("height", function(d) {
            return (yScale(d.salesTotal));
        })
        .attr("fill", function(d) {
            if (d.rank%2 == 0) {
                return "black";
            }
            else {
                return "grey";
            }
        });
    
    d3.selectAll("barRect")
    .data(topTen)
        .on("click", function(d) {
            console.log(d.name);
        })
        .on("mousemove", function(d) {
            var mouse = d3.mouse(this);
            d3.select("#tooltip")
                .style("display", "block")
                .html("<h1>" + d.name + "</h1>")
                .style("left", mouse[0] + "px")
                .style("top", mouse[1] - 50 + "px");
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip")
                .style("display", "none")
        });
    var axis = d3.axisLeft(yScale);
    d3.select("#yAxis").call(axis);
});


