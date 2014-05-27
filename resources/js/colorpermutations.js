//TODO: load JSON via AJAX from Server (asynchron!!!)
//TODO: create seperate drawing function to handle server response.
//TODO: let the user know we're waiting for server response (progressbar, mouse pointer aso.)?
//TODO: set ultimate in resizeHandler? -> seperate drawing form calculating and redraw on resize.

//global variables
var start = new Date("August 08, 2012 08:52:25"); //Start Erstaufführung
var stop = false;
var interval = false;
var fps = 5;
var present = 0;
var penultimate = 1;
var ultimate = 1;

$(document).ready(function(){
	//Window resize handler
	resizeHandler();
	$(window).resize(resizeHandler);

	//Button handler
	$("#button-fs").click(fullscreenBtnHandler);
	$("#button-play").click(togglePlay);
	$("#button-info").click(infoBtnHandler);
	$("#button-info-close").click(infoBtnHandler);
	$("#button-settings").click(settingsBtnHandler);
	$("#button-settings-close").click(settingsBtnHandler);
	$("#ctrl-container .btn").delay(4000).switchClass("btn-onload", "btn-loaded", 1000); //fade btn after load

	//Slider
	$("#settings-container input").attr("disabled", false);
	$("#slider-size").on("input change", sliderHandler);
	$("#slider-size-value").text($("#slider-size").val());


	//Hide mouse when idle
	$("#svg-container").mousemove(function(){
		$(this).css("cursor", "auto");
		setTimeout( function(){
      		$("#svg-container").css("cursor", "none");
    	},4000);
	})
});

function resizeHandler(event){
	//calculate and set canvas width and height
	var elementSize = parseInt($("#0").attr("width"), 10);
	var width = elementSize * Math.floor(($(window).width()/elementSize) - 2);
	var height = elementSize * Math.floor(($(window).height()/elementSize) - 2);

	//set ultimate, resolution and duration
	var resWidth = width / elementSize;
	var resHeight = height / elementSize;
	ultimate = resWidth * resHeight;
	$("#resolution").text("Resolution: " + resWidth + " x " + resHeight + " px");
	$("#duration").text("Duration: " + fps + " x " + Math.pow(256,3) + " ^ " + ultimate + " ms");
	$("#settings-resolution").text($("#resolution").text());

	//set canvas dimensions
	$("#svg-container").attr("width", width);
	$("#svg-container").attr("height", height);
	$("#svg-background").attr("width", width);
	$("#svg-background").attr("height", height);

	//center canvas vertically and horizontally
	$("#svg-container").css("width", width);
	$("#svg-container").css("height", height);
	$("#svg-container").css("margin-left", -width/2);
	$("#svg-container").css("margin-top", -height/2);

	var x = 0;
	var y = 0;
	//redraw all elements
	$("svg-container").children("rect").each(function () {
		//new elements location
		if (x + elementSize < svgWidth){
			//same row
			x = x + elementSize;
		} else {
			//new row
			x = 0;
			y = y + elementSize;
		}
	});
}

function fullscreenBtnHandler(){
	//toggle fullscreen
	$("#container").toggleFullScreen();

	//toggle icon icon
	if($("#container").fullScreen()){
		$(this).text("< >");
	} else {
		$(this).text("> <");
	}
}

function togglePlay(){
	if(interval){
		//Pause
		clearInterval(interval);
		interval = false;
		$(this).text("->"); //change icon
	} else {
		//Play
		$(this).text("II"); //change icon

		//hide info and settings box and disable input
		if($("#info-container").is(":visible")){
			$("#info-container").fadeToggle();
		}
		if($("#settings-container").is(":visible")){
			$("#settings-container").fadeToggle();
		}
		$("#settings-container input").attr("disabled", true);

		//reset window, background and first element
		resizeHandler();
		$("#svg-background").attr("fill", "rgb(0, 0, 0)");
		$("#0").attr("fill", "rgb(0, 0, 0)");

//TODO: ajax request!
		preloadElements();
		interval = setInterval(permuteRecursive, fps); //start interval
	}
}

function infoBtnHandler(){
	if($("#settings-container").is(":visible")){
		$("#settings-container").fadeToggle();
	}
	$("#info-container").fadeToggle();
}

function settingsBtnHandler(){
	if($("#info-container").is(":visible")){
		$("#info-container").fadeToggle();
	}
	$("#settings-container").fadeToggle();
}

function sliderHandler(){
	var size = $(this).val();
	$("#slider-size-value").text(size + " px");
	$("#0").attr("width", size);
	$("#0").attr("height", size);

	resizeHandler();
	$("#settings-resolution").text($("#resolution").text());
}


function preloadElements(){
//TODO: implement this on a server -> Big Integers!!

	//measure execution time and add it at the end
	var startTime = new Date();

	var now = new Date();
	var t = Math.round(Math.abs(start-now) / fps); //ms since start / frames per second

	//calculate color atoms
	calcColourAtoms(t);

	//convert colour atoms [x][y][z]... to element structure {[r][g][b]}...
	//(add empty atoms at the end if nescessary)
	while (colourAtoms.length % 3 != 0){
		colourAtoms.push(0);
	}

	//draw all color elements
	var numElements = colourAtoms.length / 3;
	for (var i = 0; i < numElements; i++){
		var r = colourAtoms[3 * (i + 1) - 3];
		var g = colourAtoms[3 * (i + 1) - 2];
		var b = colourAtoms[3 * (i + 1) - 1];

		if(elementExists(i)){
			$("#" + i).attr("fill", "rgb(" + r + ", " + g + ", " + b + ")");
		} else {
			addNewElement(i, r, g, b);
		}
	}

	//compensate execution time
	var stopTime = new Date();
	var execTime = startTime - stopTime;
	for (var i = 0; i < execTime; i++){
		permuteRecursive();
	}
}

var colourAtoms = []; //array of colours (0...255) not organised in rgb elements yet
function calcColourAtoms(imp, i){
	i = (typeof i === "undefined") ? Math.floor(Math.log(imp)/ Math.log(256)) : i;

	//Base case
	if( i === 0){
		colourAtoms[i] = imp;
		return;
	}
	//Recursion
	else {
		remainder = imp % Math.pow(256, i);
		if(remainder === 0){
			//solution for problem of 256%256 = 0 AND 0%256 = 0!
            if ((imp / Math.pow(256, i)) === 1) {
            	//case 256%256 => value = 1!
                colourAtoms[i] = 1;
            } else {
            	//Case 0%256 => value = 0!
                colourAtoms[i] = 0;
            }
		} else {
			colourAtoms[i] = (imp - remainder) / Math.pow(256, i);
		}
		calcColourAtoms(remainder, i - 1);
	}
}


function permuteRecursive(){
	if(!nextColor(present)){
		//element doesn't exist or can't be permuted
		if(present < ultimate){
			if(present < penultimate){
				present ++;
				permuteRecursive(present);
			} else {
				addNewElement(present);
				penultimate ++;
			}
			resetPreviousElements(present);
			present = 0;
		} else {
			//done! - no more permutations left for this canvas
			stop();
			return;
		}
	}
}

function stop(){
	if(interval){
		togglePlay();
		if(stop){
			var stop = new Date();
			$("#stop").text(stop)
		}
	}
}

function nextColor(id){
	if(elementExists(id)){
		var colors = $("#" + id).attr("fill").match(/\d+/g);
		if (colors[0] < 255) {
			colors[0] ++;
		} else if (colors[1] < 255){
			colors[0] = 0;
			colors[1] ++;
		} else if (colors[2] < 255){
			colors[0] = 0;
			colors[1] = 0;
			colors[2] ++;
		} else {
			return false;
		}
		$("#" + id).attr("fill", "rgb(" + colors[0] + "," + colors[1] + "," + colors[2] + ")");
		return true;
	}
	return false;
}

function elementExists(id){
	if($("#" + id).length){
		return true;
	}
	return false;
}

function resetPreviousElements(id){
	for (var i = 0; i < id; i++){
		resetElement($("#" + i));
	}
}

function resetElement($id){
	$id.attr("fill", "rgb(0,0,0)");
}


function addNewElement(id, r, g, b){
	//set default value 0 for optional parameter color
	r = (typeof r === "undefined") ? 1 : r;
	g = (typeof g === "undefined") ? 0 : g;
	b = (typeof b === "undefined") ? 0 : b;

	//svg canvas dimentions
	var svgWidth = $("#svg-container").attr("width");
	var svgHeight = $("#svg-container").attr("height");

	//last elements size and location
	var elementSize = parseInt($("#" + (id-1)).attr("width"), 10);
	var x = parseInt($("#" + (id-1)).attr("x"), 10);
	var y = parseInt($("#" + (id-1)).attr("y"), 10);

	//new elements location
	if (x + elementSize < svgWidth){
		//same row
		x = x + elementSize;
	} else {
		//new row
		x = 0;
		y = y + elementSize;
	}

	//create new element
	var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect.setAttribute("id", id);
	rect.setAttribute("x", x);
	rect.setAttribute("y", y);
	rect.setAttribute("width", elementSize);
	rect.setAttribute("height", elementSize);
	rect.setAttribute("fill", "rgb(" + r + "," + g + "," + b + ")");

	//append new element (unfortunatley jquery doesn't support append on svg!)
	document.getElementById("svg-container").appendChild(rect);
}
