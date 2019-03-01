d3.queue()
    .defer(d3.csv,"/data/CSVdata.csv")
    .defer(d3.csv,"/data/Final_Project_Data/vgsales.csv")
    .defer(d3.json,"/data/world.json")
    .awaitAll(function(error,dataArray) {
        var data = dataArray[0];

        data.forEach(function(d) {
            d.export = parseFloat(d.export);
        });
        var latestData = data.filter(function(d) {
            return d.year == "2018";
        })
        var domain = d3.extent(latestData, function(d){
            return d.export;
        });
        var colorScale = d3.scaleLinear()
            .domain(domain)
            .range(["navy","aqua"]);

        var vgsales = dataArray[1];
        var countryTopoJSON = dataArray[2];
        var geoJSON = topojson.feature(countryTopoJSON, countryTopoJSON.objects.countries);
        console.log(geoJSON);
        geoJSON.features =geoJSON.features.filter(function(country) {
            return country.id != "AQ" && country.id != -99 ;
        });

        var width = window.innerWidth - 100;
        var height = window.innerHeight - 150;

        //projection mapping
        var proj = d3.geoMercator()
            .fitSize([width,600], geoJSON);
        var path = d3.geoPath()
            .projection(proj);

        var svg = d3.selectAll("#mymap")
            .attr("width", width + "px")
            .attr("height", height + "px");
        var countries = svg.selectAll("path")
            .data(geoJSON.features);
          
        countries.enter().append("path")
            .attr("d", function(d) {
                return path(d);
            })
            .attr("fill",function(feature) {
                var matches = latestData.filter(function(d){
                        return d.country == feature.id.toLowerCase();
                });
                if (matches.length >0) {
                    return colorScale(matches[0].export);
                }
                else {
                    return "rgb(200,200,200)";
                }
            });



        var points = [
            {"name": "Boston", "coords": [-71.0589, 42.3601]},
            {"name": "London", "coords": [-0.1278, 51.5074]},
            {"name": "Chicago", "coords": [-87.6298, 41.8781]}
            ];
            
        var cities = svg.selectAll("circle")
            .data(points);
            
        cities.enter().append("circle")
            .attr("transform", function(d){
                return "translate(" + proj(d.coords) + ")";
            })
            .attr("r",10)
            .attr("fill","purple");
    });





// d3.json("/data/world.json", function(error, data) {
//     console.log("JSON data error:", error);
//     console.log("JSON contents:", data);
// });

// d3.csv("/data/Final_Project_Data/vgsales.csv", function(error, data) {
//     console.log("csv data error:", error);
//     console.log("csv contents:", data);

//     //parse data into variables
//     data.forEach( 
//         function(d){ 
//             d.rank = parseInt(d.Rank); // Sales rank
//             d.name = d.Name; // Name of game
//             d.platform = d.Platform; // Release platform for the game
//             d.year = parseInt(d.Year); // Year of release (Since 1980 to 2016)
//             d.genre = d.Genre; // Game genre
//             d.publisher = d.Publisher; // Company which released the game
//             d.salesNA = parseFloat(d.EU_Sales) * 1000000; // European sales
//             d.salesJPN = parseFloat(d.JP_Sales) * 1000000; // Japan sales
//             d.salesOther = parseFloat(d.Other_Sales) * 1000000; // Sales in other countries
//             d.salesTotal = parseFloat(d.Global_Sales) * 1000000; // Global Sales
//             // console.log(d);
//         }
//     );
// });