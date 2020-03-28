import "../public/snackbar.css"
import "../public/default.css"

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

    //calculateHash(files[0]);

    var ext = files[0].name.substr(files[0].name.lastIndexOf('.') + 1);
    if (videoExtensions.includes(ext)){

        console.log("Setting local video: " + files[0].name)
        video.setSource(URL.createObjectURL(files[0]));
        
    } else if (["vtt", "srt"].includes(ext)) {
        video.addSubtitleFile(files[0], ext);
    }
});

/*
import CryptoJS from 'crypto-js'
function calculateHash(file: File) {

    console.log("Calculating hash for " + file.name);
    
    var reader = new FileReader();
    reader.addEventListener('load',function () {

        var hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(String(this.result)));
        var md5 = hash.toString(CryptoJS.enc.Hex)
        var output = "MD5 (" + file.name + ") = " + md5;

        console.log(output);
        room.addVideoHash(md5, file.name);
    });
    
    reader.readAsBinaryString(file);
}
*/