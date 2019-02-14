d3.text("/data/TextData.txt", function(error, data) {
    console.log("text data error:", error);
    console.log("text contents:", data);
});

d3.csv("/data/CSVdata.csv", function(error, data) {
    console.log("csv data error:", error);
    console.log("csv contents:", data);
    data.forEach ( 
        function(d){ 
            d.export = parseFloat(d.export);
            d.country = parseFloat(d.country);
            console.log(d);
        }
    );
});

d3.json("/data/JSONdata.json", function(error, data) {
    console.log("JSON data error:", error);
    console.log("JSON contents:", data);
});

console.log("This stuff doesn't output in order.");