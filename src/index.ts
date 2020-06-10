import "../public/snackbar.css"
//import "../public/default.css"

var pjson = require('../package.json');
console.log("Version " + pjson.version);

import queryString from 'query-string'
const parsedHash = queryString.parse(location.hash);

import * as room from './room'
if (parsedHash.r) {
    room.join('room-' + parsedHash.r);
} else {
    room.create();
}

import * as video from './video'

const streamButton = <HTMLButtonElement> document.getElementById('streamButton');
streamButton.onclick = video.sourceInput;

const sourceInput = document.getElementById("sourceInput");
if (sourceInput) {
    sourceInput.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            streamButton.click();
            console.log("enter");
        }
    }); 
}

var dragDrop = require('drag-drop');
var videoExtensions = require('video-extensions');
dragDrop('body', function (files: any) {
    var ext = files[0].name.substr(files[0].name.lastIndexOf('.') + 1);
    if (videoExtensions.includes(ext)){
        video.setSource(URL.createObjectURL(files[0])); 
    }
});