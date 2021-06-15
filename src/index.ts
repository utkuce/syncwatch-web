//import "../public/snackbar.css"
//import "../public/default.css"

var pjson = require('../package.json');
console.log("Version " + pjson.version);

import queryString from 'query-string'
const parsedHash = queryString.parse(location.hash);

import * as room from './room'
import * as firebase from 'firebase/app'
import 'firebase/auth'

// First thing is to login and acquire a firebase auth id
firebase.auth().onAuthStateChanged(function(user) {
      
    if (user) {

        console.log("Logged in with firebase id " + user.uid);

        // Then join the room if the link has the room number
        if (parsedHash.r) {
            room.join(parsedHash.r.toString(), user.uid);
        } else { // or create a room
            room.create(user.uid);
        }

    } else {
        console.log("Could not get firebase user id")
    }
});

firebase.auth().signInAnonymously().catch(function(error) {
 
    if (error) {
        console.log("Firebase anonymous login error: " + 
        error.code + ", " + error.message);
    }
});
 

import './interface'