// data obtained from https://www.kaggle.com/gregorut/videogamesales#vgsales.csv


//load data
d3.csv("/data/Final_Project_Data/vgsales.csv", function(error, data) {
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
    // console.log(data);


    //use data.filter to look at games released before 2000 only
    var oldGameData = data.filter(function(d){
        return d.year < 2000;
    });
    oldGameData.forEach(function(d,i) {
        d.rank = i+1;
    });
    console.log("Games released before 2000:");
    console.log(oldGameData);


    //use "d3.extent" to look at the range of global sales numbers
    var salesExtent = d3.extent(data, function(d) {
        return d.salesTotal;
    });
    console.log("Range of global sales data:");
    console.log(salesExtent);

    // use d3.nest to group up data based on platform
    var groupedPlatformData = d3.nest()
        .key(function(d) {
            return d.platform;
        })
        .entries(data);

    // based on platform grouping above, use d3.sum to add up total global sales for all games of a certain platform
    groupedPlatformData.forEach(function(d){
        d.total = d3.sum(d.values, function(row){
            return row.salesTotal;
        });
        d.average = d3.mean(d.values, function(row){
            return row.salesTotal;
        });
    });
    console.log("Data grouped by platform, including total number of games sold for each platform and average number of sales for a game on that platform:");
    console.log(groupedPlatformData);

    // use d3.nest to group up data based on publisher
    var groupedPublisherData = d3.nest()
        .key(function(d) {
            return d.publisher;
        })
        .entries(data);
    console.log("Data grouped by publisher:");
    console.log(groupedPublisherData);

    //use mapping function to expand console names beyond abbreviations in data
    var consoleMapping = {
        "PC": "Personal Computer",
        "NES": "Nintendo Entertainment System",
        "GB": "Game Boy",
        "DS": "Nintendo Dual Screen",
        "X360": "Xbox 360",
        "PS": "Playstation",
        "PS2": "Playstation 2",
        "PS3": "Playstation 3"
    };
    // perform mapping
    var consoleMappedData = data;
    consoleMappedData.forEach(function(d) {
        d.fullPlatformName = consoleMapping[d.platform];
    });
    console.log("Data with platform name expanded as \"fullPlatformName\" (for some):");
    console.log(consoleMappedData);
});

// how to load multiple files (do this INSTEAD of multiple d3.csv functions)
/*
3.queue()
    .defer(d3.csv,"1ST FILE LOCATION")
    .defer(d3.csv,"2ND FILE LOCATION")
    .awaitAll(function(error,dataArray) {//error checking
    
    var countryNames = {}; //if two+ files are incompatible you can do stuff like this
    lookup.forEach(function(d){
        countryNames[d,code] = d.name;
        //countryNames.mx = "Mexico"
    }); //do all your normal data manipulation stuff after this
});
*/