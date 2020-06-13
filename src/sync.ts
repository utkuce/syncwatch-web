// *****************************************************************************
// functions related to receiving and sending sync data from and to the database
// *****************************************************************************

import * as firebase from 'firebase/app'
import {isEqual} from 'lodash';

import * as video from './video'
import {roomId, myUserId} from './room'
import {updateUsersDisplay} from './interface'

var lastSentEvent : any;
var lastReceivedEvent : any;

export function sendData(data: any) { // play-pause,seek,url

    // abort if the room id is not set yet
    if (roomId == null)
        return;

    // do not send back the received events to prevent feedback loops
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

// handling when a node on the database is updated or created
export function listenRoom(roomRef: firebase.database.Reference) {

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

            // stop sending video state events for 500ms 
            // after receiving one to prevent feedback loops
            eventCooldown = true;
            setTimeout(()=>{eventCooldown=false}, 500);

            video.seekTo(parseFloat(data["position"]));
            video.setPause(data["paused"]);

            break;

        case "sourceURL":

            // { "sourceURL": url}
            video.setSource(data);

            break;
        
        case "users":

            //{"users":{"user-0":"name1","user-1":"name2","user-3":"name3"}
            updateUsersDisplay(data, roomId, myUserId);
    }
}