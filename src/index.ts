import * as room from './room'
import './video'
import queryString from 'query-string'
import { sourceInput } from './video';

const parsedHash = queryString.parse(location.hash);
if (parsedHash.r) {
    room.join('room-' + parsedHash.r);
} else {
    room.create();
}

const form : HTMLFormElement|null = <HTMLFormElement> document.getElementById('form');
if (form) form.addEventListener("submit", sourceInput);