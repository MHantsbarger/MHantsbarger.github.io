d3.text("/data/TextData.txt", function(error, data) {
    console.log("text data error:", error);
    console.log("text contents:", data);
});

d3.csv("/data/CSVdata.csv", function(error, data) {
    console.log("csv data error:", error);
    console.log("csv contents:", data);
  });