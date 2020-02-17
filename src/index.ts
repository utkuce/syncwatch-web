import * as room from './room'
import './video'
import queryString from 'query-string'
import { sourceInput } from './video';

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