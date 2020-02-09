import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

import uniqid from 'uniqid'
import {isEqual} from 'lodash';

import * as video from './video'

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

var roomId: string;

export function create() {

    roomId = uniqid('room-');
    var roomRef = firebase.database().ref(roomId);
    roomRef.set(null,

        function(error: Error | null){

            if (error) {
                console.error(error);
                return;
            }
            
            console.log('Room created on firebase database');

            join(roomId);

            //tui.setRoomLink(roomLink);
        }

    );

    return roomId.split('-')[1];
}

var lastSentEvent : any;
var lastReceivedEvent : any;

export function sendData(data: any) {

    if (roomId == null)
        return;

    if (isEqual(lastReceivedEvent, data))
        return;

    lastSentEvent = data;

    var roomRef = firebase.database().ref(roomId);
    roomRef.update(data,

        function(error: Error | null){

            if (error) {
                console.error(error);
                return;
            }
            
            console.log("Sent: " + JSON.stringify(data));
        }
    ); 
}

export function join(rId: string) {

    roomId = rId;
    //tui.setRoomLink("syncwatch://" + roomId);

    const username = "Guest"; //TODO: modifiable

    const myUserId = uniqid('user-');
    var roomRef = firebase.database().ref(roomId);


    roomRef.child("users").update( {
            [myUserId]: "Guest"}, function(error: Error | null){

                if (error) {
                    console.error(error);
                    return;
                }
                
                console.log("Joined the room as " + myUserId + "(" + username + ")" );
                listenRoom(roomRef);
            }
    );

    roomRef.child("users/" + myUserId).onDisconnect().remove(
        function(error: Error | null) {
            if (error) {
                console.error(error);
                return;
            }
        }
    );
}

function listenRoom(roomRef: firebase.database.Reference) {

    roomRef.on("child_added", function(snapshot: any, prevChildKey?: string|null) {
        handleData(snapshot)
    });

    roomRef.on("child_changed", function(snapshot: any, prevChildKey?: string|null) {
        handleData(snapshot)
    });
}

function handleData(snapshot : any) {

    var eventType : string = snapshot.key;
    var data = snapshot.val();

    lastReceivedEvent = {[eventType]: data};
    if (isEqual(lastReceivedEvent, lastSentEvent))
        return;

    console.log("Received: " + JSON.stringify(lastReceivedEvent));

    switch (eventType) {

        case "videoState":

            // { "videoState": { "position": vid.currentTime, "paused": vid.paused } }
            video.seekTo(parseFloat(data["position"]));
            video.setPause(data["paused"]);

            break;

        case "sourceURL":

            // { "sourceURL": url}
            video.setSource(data);

            break;
        
        case "users":

            //{"users":{"user-0":"name1","user-1":"name2","user-3":"name3"}

            var usersElement = document.getElementById('users');
            if (usersElement) {
                usersElement.innerHTML = '';
                for (var key in data) {

                    var userId = key;
                    var userName = data[key];
                    
                    var user = document.createElement('a');
                    if (userName === "Guest") {
                        user.innerHTML = "Guest " + userId.split('-')[1];
                        user.setAttribute('class', 'class="w3-bar-item w3-button w3-hover-white"')
                    } else {
                        user.innerHTML = userName;
                        user.setAttribute('class', 'class="w3-bar-item w3-button"')
                    }
                    
                    usersElement.appendChild(user);
                }
            }
    }
}