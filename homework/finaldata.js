// data obtained from https://www.kaggle.com/gregorut/videogamesales#vgsales.csv

d3.csv("/data/Final_Project_Data/vgsales.csv", function(error, data) {
    console.log("csv data error:", error);
    console.log("csv contents:", data);
    data.forEach ( 
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
    console.log(data);
});
