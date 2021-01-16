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

    roomId = uniqid('room-');
    var roomRef = firebase.database().ref(roomId);
    roomRef.child("created").set(Date.now(),

        function(error: Error | null){

            if (error) {
                console.error(error);
                return;
            }
            
            console.log('Room created on firebase database');
            console.log("Joining " + roomId);
            join(roomId, uid);
        }
    );
}

export var myUserId: string;
export function join(rid: string, uid: string) {

    roomId = rid;
    var userName = "Guest";

    if (localStorage['username']) {
        console.log("Username is set to: " + localStorage['username'])
        userName = localStorage['username'];
    } else {
        localStorage['username'] = userName;
    }     

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

export function lastInRoom(last: boolean) {

    // cleanup the room before leaving if you're the last person
    var roomRef = firebase.database().ref(roomId);
    ["created", "videoState", "videoSource"].forEach(function(node: any){
        var onDisc =  roomRef.child(node).onDisconnect();
        last ? onDisc.remove() : onDisc.cancel();
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