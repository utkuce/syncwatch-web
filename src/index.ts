import * as room from './room'
import './video'
import queryString from 'query-string'
import { sourceInput } from './video';

const parsedHash = queryString.parse(location.hash);
var roomNumber : string|string[];
if (parsedHash.r) {
    roomNumber = parsedHash.r;
    room.join('room-' + parsedHash.r);
} else {
    roomNumber = room.create();
    window.location.hash = "r=" + roomNumber;
}

const roomNumberElement = document.getElementById('roomNumber');
if (roomNumberElement)
    roomNumberElement.innerHTML = 'Joined room ' + roomNumber;


const form : HTMLFormElement|null = <HTMLFormElement> document.getElementById('form');
if (form) form.addEventListener("submit", sourceInput);