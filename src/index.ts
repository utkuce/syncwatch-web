//import "../public/snackbar.css"
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

import './interface'