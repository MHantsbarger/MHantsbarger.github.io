var link = function() {
    if ( document.getElementById("ImageBackground").src.match("javascript_bg_1.png") ) {
        var audio = new Audio('xLink.mp3');
        audio.volume = 0.5; 
        audio.play();
        document.getElementById("ImageBackground").src = "javascript_bg_2.png";
        console.log("Linked to Myst Island.");
    }
    else if ( document.getElementById("ImageBackground").src.match("javascript_bg_2.png") ) {
        console.log("You already linked!");
    }
}