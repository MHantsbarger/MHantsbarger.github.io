console.log("Hello!");

// d3 has selector, similar to Javascripts ".getElementById"
// how you create d3 elements
var title = d3.select("#title");
console.log(title);

// can manipulate stuff about it
title.attr("class", "big");
title.style("color", "red");

// d3 can chain stuff too (this is all one "command")
title
    .attr("class", "big")
    .style("color", "red")
    .style("font-family","Comic Sans MS");

var svg = d3.select("svg");
var circleDots = svg.selectAll(".dot");

circleDots.style("fill", "red");

// function to change elements of each .dot object
function changeColor(color) {
    circleDots.style("fill", color);
}

// function
function dance() {
    circleDots.attr( "cx", function() {return Math.random()*200 + 80;} );
}

var starterData = [12,33,17];
function radius() {
    circleDots.data(starterData);
    // can use d to use the data, and i to use the index
    circleDots.attr( "r", function(d) {return d;} );
}

// using enter to append data
var starterData2 = [12,33,17,56]; // this has one more data point than circles
function radiusMore() {
    var circleData = circleDots.data(starterData2);
    circleData.enter().append("circle") //will add a circle with the following properties if there's extra data
        .attr("class", "dot")
        .attr("cx", 50)
        .attr("cy", 100)
        .attr("r", function(d) {return d;});

    circleData.attr( "r", function(d) {return d;} );
    circleDots=svg.selectAll(".dot");
}

var starterData3 = [12,33];
function radiusLess() {
    var circleData = circleDots.data(starterData3);
    circleData.exit().remove(); // will remove any extraneous circles
    circleData = circleDots.data(starterData3);
    circleData.attr( "r", function(d) {return d;} );
    circleDots=svg.selectAll(".dot");
}

