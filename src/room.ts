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
        }
    );
}

var lastSentEvent : any;
var lastReceivedEvent : any;

export function sendData(data: any) { // play-pause,seek,url

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

var myUserId: string;
export function join(rId: string) {

    roomId = rId;
    var userName = "Guest";

    if (localStorage['username']) {
        console.log("Username is set to: " + localStorage['username'])
        userName = localStorage['username'];
    } else {
        localStorage['username'] = userName;
    }

    myUserId = uniqid('user-');
    var roomRef = firebase.database().ref(roomId);

    roomRef.child("users").update( {
            [myUserId]: {"name": userName}}, function(error: Error | null){

                if (error) {
                    console.error(error);
                    return;
                }
                
                console.log("Joined the room as " + myUserId + "(" + userName + ")" );

                const roomNumber: string = roomId.split('-')[1];
                window.location.hash = "r=" + roomNumber;

                const roomNumberElement = document.getElementById('roomNumber');
                if (roomNumberElement)
                    roomNumberElement.innerHTML = 'Joined room ' + roomNumber;

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
        onDatabaseUpdate(snapshot)
    });

    roomRef.on("child_changed", function(snapshot: any, prevChildKey?: string|null) {
        onDatabaseUpdate(snapshot)
    });
}

export var eventCooldown = false;
function onDatabaseUpdate(snapshot : any) {

    var eventType : string = snapshot.key;
    var data = snapshot.val();

    lastReceivedEvent = {[eventType]: data};
    if (isEqual(lastReceivedEvent, lastSentEvent))
        return;

    console.log("Received: " + JSON.stringify(lastReceivedEvent));

    switch (eventType) {

        case "videoState":

            // { "videoState": { "position": vid.currentTime, "paused": vid.paused } }

            // stop sending video state events for 200ms 
            // after receiving one to prevent feedback loops
            eventCooldown = true;
            setTimeout(()=>{eventCooldown=false}, 200);

            video.seekTo(parseFloat(data["position"]));
            video.setPause(data["paused"]);

            break;

        case "sourceURL":

            // { "sourceURL": url}
            video.setSource(data);

            break;
        
        case "users":

            //{"users":{"user-0":"name1","user-1":"name2","user-3":"name3"}
            updateUsersDisplay(data);
    }
}

function updateUsersDisplay(data: any) {

    var usersElement = document.getElementById('users');
    if (usersElement) {
   
        usersElement.innerHTML = '';
  
        for (var key in data) {

            var userId = key;
            var userName = data[key]["name"];
            var user = document.createElement('a');                  

            if (userName === "Guest") {
                user.innerHTML = "Guest " + userId.split('-')[1];
            } else {
                user.innerHTML = userName;
            }

            if (userId === myUserId) {

                user.setAttribute('class', 'class="w3-bar-item w3-button w3-hover-white"');
                user.setAttribute("style", "padding:16px;")
                user.innerHTML += " ✎"
                user.onclick = editName;
                ownUserElement = user;

            } else {
                user.setAttribute("style", "display:block; padding:16px;")
            } 
            
            usersElement.appendChild(user);
        }
    }
}

var ownUserElement : HTMLAnchorElement;
function editName() {

    var name = prompt("Please enter your name");
    if (name != null) {

        localStorage['username'] = name;
        ownUserElement.innerHTML = name;
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
}