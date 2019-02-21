// data obtained from https://www.kaggle.com/gregorut/videogamesales#vgsales.csv

d3.csv("/data/Final_Project_Data/vgsales.csv", function(error, data) {
    console.log("csv data error:", error);
    console.log("csv contents:", data);
    data.forEach ( 
        function(d){ 
            d.rank = parseFloat(d.rank); // Sales rank
            d.name = parseFloat(d.name); // Name of game
            d.platform = parseFloat(d.platform); // Release platform for the game
            d.year = parseFloat(d.year); // Year of release (Since 1980 to 2016)
            d.genre = parseFloat(d.genre); // Game genre
            d.publisher = parseFloat(d.publisher); // Company which released the game
            d.salesNA = parseFloat(d.salesNA); // North american sales (in millions of copies)
            d.salesEU = parseFloat(d.salesEU); // European sales
            d.salesJPN = parseFloat(d.salesJPN); // Japan sales
            d.salesOther = parseFloat(d.salesOther); // Sales in other countries
            d.salesTotal = parseFloat(d.salesTotal); // Global_Sales
            console.log(d);
        }
    );
});
