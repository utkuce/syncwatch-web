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

const form : HTMLFormElement = <HTMLFormElement> document.getElementById('form');
form.addEventListener("submit", video.sourceInput);

var dragDrop = require('drag-drop');
var videoExtensions = require('video-extensions');
dragDrop('body', function (files: any) {

    var ext = files[0].name.substr(files[0].name.lastIndexOf('.') + 1);
    if (videoExtensions.includes(ext)){

        video.setSource(URL.createObjectURL(files[0]));
        
    } else if (["vtt", "srt"].includes(ext)) {
        //video.addSubtitleFile(files[0], ext);
    }
});