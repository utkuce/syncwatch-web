import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

import uniqid from 'uniqid'
import {isEqual} from 'lodash';

import * as videoplayer from '../desktop/videoplayer';
import * as tui from '../desktop/tui'

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
export var roomLink: string = "not_set";

export function create() {

    roomId = uniqid('room-');
    roomLink = "syncwatch://" + roomId;
    
    var roomRef = firebase.database().ref(roomId);
    roomRef.set({"sourceURL": 0, "videoState": { "position": 0, "paused": 0 }},

        function(error: Error | null){

            if (error) {
                console.error(error);
                return;
            }
            
            console.log('Room created on firebase database');
            console.log("Join link: " + roomLink);
            tui.setRoomLink(roomLink);
        }

    );

    listenVideoState(roomId);
}

export function join(roomId: string) {
    listenVideoState(roomId);
}

var lastReceivedEvent = new Object();
var lastSentEvent : any;

export function sendData(data: any) {

    lastSentEvent = data;

    var roomRef = firebase.database().ref(roomId);
    roomRef.update(data,

        function(error: Error | null){

            if (error) {
                console.error(error);
                return;
            }
            
            console.log("Sent event: " + JSON.stringify(data));
        }
    ); 
}

function listenVideoState(roomId: string) {

    var roomRef = firebase.database().ref(roomId);
    roomRef.on("child_changed", function(a: any, prevChildKey?: string|null) {

        var eventType : string = a.key;
        var data = a.val();

        var newEvent = {[eventType]: data};
        if (isEqual(newEvent, lastSentEvent))
            return;

        console.log("Received event: " + JSON.stringify(newEvent));

        switch (eventType) {

            case "videoState":
    
                // { "videoState": { "position": vid.currentTime, "paused": vid.paused } }
                videoplayer.setPause(data["paused"]);
                videoplayer.setPosition(parseFloat(data["position"]));
    
                break;
    
            case "sourceURL":
    
                // { "sourceURL": url}
                videoplayer.setSource(data.val(), false);

                break;
        }
    });
}