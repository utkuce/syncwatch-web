import * as room from './room'
import './video'
import queryString from 'query-string'
import { sourceInput, setSource } from './video';

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
    var videoExtensions = require('video-extensions');
    if (videoExtensions.includes(ext)){
        console.log("Setting local video: " + files[0].name)
        setSource(URL.createObjectURL(files[0]));
    }
});