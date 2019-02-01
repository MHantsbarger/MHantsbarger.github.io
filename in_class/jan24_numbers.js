// var means variable
var myNumber = 42;
console.log("myNumber is " + myNumber);
console.log("myNumber x100 is " + (myNumber*100));

var username = "Matthew";
console.log("username is " + username);

var isNumberBig = (myNumber>100);
console.log("isNumberBig = " + isNumberBig);

var myArray = ["Matt", 100, "Me", "You"];
console.log("myArray[0] is "+ myArray[0]);

var myMap = {
    name: "Matt",
    dog: "false",
    favColor: "pink",
    greet: function(greeting) {
        console.log("Seasons Greasons, " + name + "!");
    }
};
console.log("myMap.favColor is "+ myMap.favColor);

var sayHello = function(name) {//a function with an input
    console.log("Hello " + name + "!");
}
sayHello(myMap.name); //executes above function

var plusTen = function(num) {//a function that returns a value
    return num+10;
}
var newNum = 20;
console.log("newNum is " + newNum + ". newNum plus 10 is " + (newNum = plusTen(newNum)));

if (newNum >100) { //if statements
    console.log("newNum is over 100!");
}
else {
    console.log("newNum is less than (or equal to) 100.");
}

function greaterThanTen(num) { //returns a boolean and prints out to the console
    if (num > 10) {
        console.log("greater than 10!");
    }
    else {
        console.log("less than 10!");
    }
    return num > 10;
}
console.log(greaterThanTen(20)); // this should return true

document.getElementById("title").innerHTML = "THIS PAGE HACKED BY JAVASCRIPT.";