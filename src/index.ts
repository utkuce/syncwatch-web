import * as room from './room'
import './video'
import queryString from 'query-string'
import { sourceInput, setSource, addSubtitles } from './video';
var videoExtensions = require('video-extensions');
var pjson = require('../package.json');

console.log("Version " + pjson.version);

const parsedHash = queryString.parse(location.hash);
if (parsedHash.r) {
    room.join('room-' + parsedHash.r);
} else {
    room.create();
}

const form : HTMLFormElement = <HTMLFormElement> document.getElementById('form');
form.addEventListener("submit", sourceInput);

var dragDrop = require('drag-drop')
dragDrop('body', function (files: any) {

    var ext = files[0].name.substr(files[0].name.lastIndexOf('.') + 1);
    if (videoExtensions.includes(ext)){

        console.log("Setting local video: " + files[0].name)
        setSource(URL.createObjectURL(files[0]));
        
    } else if (["vtt", "srt"].includes(ext)) {
        addSubtitles(files[0], ext);
    }
});