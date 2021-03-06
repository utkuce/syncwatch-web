// *************************************************
// functions related to creating or joining the room
// *************************************************

import * as firebase from 'firebase/app'
import 'firebase/database'

import uniqid from 'uniqid'
import {listenRoom} from './sync'
import * as ui from './interface'

var firebaseConfig = {
    apiKey: "AIzaSyBXuvO9e7-ag2fqbSV5gPoBmOlCedfIHuk",
    authDomain: "syncwatch-25414.firebaseapp.com",
    databaseURL: "https://syncwatch-25414.firebaseio.com",
    projectId: "syncwatch-25414",
    storageBucket: "syncwatch-25414.appspot.com",
    messagingSenderId: "96966942702",
    appId: "1:96966942702:web:49af6d60d5668ffddcf8ff"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export var roomId: string;

export function create(uid: string) {

    firebase.database().ref().push()
        .then((roomRef: firebase.database.Reference) => {

        if (roomRef.key != null)
        {
            roomId = encodeURIComponent(roomRef.key);
            console.log('Room created on firebase database');
            console.log("Joining room " + roomId);
            join(roomId, uid);
        }
        
    }, (reason: any) => {
        console.log("Could not create room, " + reason);
    });
}

export var myUserId: string;
export function join(rid: string, uid: string) {

    roomId = rid;
    var userName = "Guest";

    if (localStorage['username'])
        userName = localStorage['username'];
    
    console.log("Username is set to: " + userName)

    myUserId = uid;

    var roomRef = firebase.database().ref(roomId);

    addUser(roomRef, userName);
    connectedCheck(roomRef, userName);
}

function addUser(roomRef: any, userName: string) {

    onUserLeave(roomRef);
    roomRef.child("users").update( {
        [myUserId]: {"name": userName}}, function(error: Error | null){
    
            if (error) {
                console.error(error);
                return;
            }
                    
            console.log("Joined the room as " + myUserId + " (" + userName + ")" );
            ui.setRoomNumber(roomId);
            listenRoom(roomRef);
        }
    );
}

function onUserLeave(roomRef: any) {

    roomRef.child("users/" + myUserId).onDisconnect().remove(
        function(error: Error | null) {
            if (error) {
                console.error(error);
                return;
            }
        }
    ); 

    roomRef.child("lastLeaverTime").onDisconnect().set(
        firebase.database.ServerValue.TIMESTAMP
    ); 
}

function connectedCheck(roomRef: any, userName: string) {

    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function(snap) {

        console.log("Connected status: ", snap.val())
        if (snap.val() !== true) {

            ui.connectionLost();
            firebase.database().goOnline();
            onUserLeave(roomRef);

        } else {

            addUser(roomRef, userName);
        }
    });
}

export function updateUsername(name: string) {
    
    firebase.database().ref(roomId).child("users/" + myUserId + "/name")
        .set(name, function(error: Error | null){
            if (error) {
                console.error(error);
                return;
            }   
            console.log("Updated name of " + myUserId + " to " + name );
        }
    );
}