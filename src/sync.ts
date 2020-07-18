// *****************************************************************************
// functions related to receiving and sending sync data from and to the database
// *****************************************************************************

import * as firebase from 'firebase/app'
import {isEqual} from 'lodash';

import * as video from './video'
import {roomId, myUserId, lastInRoom} from './room'
import {updateUsersDisplay} from './interface'

var lastSentEvent : any;
var lastReceivedEvent : any;

export function sendVideoSource(sourceURL: string) {
    sendData({"videoSource": sourceURL});
}

var lastEvent : any;
export function sendVideoState(paused: boolean, position: number) {

    var event = { "videoState": { "position": String(position), "paused": paused }} 
  
    // filter duplicate events coming from the video player
    if (!isEqual(event, lastEvent)) {
        lastEvent = event;
        console.log("video event: ", event);
        if (!eventCooldown) {
            event["videoState"]["position"] += ":" + Date.now()
            sendData(event);
        }
  }
}

function sendData(data: any) { // play-pause,seek,url

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
            
            console.log("Sent: ", data);
        }
    ); 
}

// handling when a node on the database is updated or created
export function listenRoom(roomRef: firebase.database.Reference) {

    // default video will be replaced as soon as a new source is received
    video.showDefaultVideo();

    ["child_added", "child_changed"].forEach(function(eventType: any) {
        roomRef.on(eventType, function(snapshot: any, prevChildKey?: string|null) {
            onDatabaseUpdate(snapshot);
        });
    });
}

export var eventCooldown = false;
function onDatabaseUpdate(snapshot : any) {

    var eventType : string = snapshot.key;
    var data = snapshot.val();

    lastReceivedEvent = {[eventType]: data};
    if (isEqual(lastReceivedEvent, lastSentEvent))
        return;

    console.log("Received data: ", lastReceivedEvent);

    switch (eventType) {

        case "videoState":

            // { "videoState": { "position": vid.currentTime, "paused": vid.paused } }

            // stop sending video state events for 500ms after receiving one
            // to prevent feedback loops but if it's longer than that sending back
            // the  same event is what we want to prevent desyncronization

            eventCooldown = true;
            setTimeout(()=>{eventCooldown=false}, 500);

            // position comes in format seconds:epoch_time 
            // where epoch time is the original moment of event
            // so we can adjust the position for the time passed since the event
            // unless the video is paused, because then it shouldn't be adjusted

            var position : number = parseFloat(data["position"].split(":")[0]);
            var timeDifference: number = (Date.now() - parseFloat(data["position"].split(":")[1]))/1000;
            var adjustedPosition : number = position + timeDifference;
            console.log("Adjusted position: " + timeDifference + " seconds");

            // the order is important for youtube player
            data["paused"] ? video.seekTo(position) : video.seekTo(adjustedPosition);
            video.setPause(data["paused"]);

            break;

        case "videoSource":

            // { "videoSource": source}
            video.setSource(data)

            break;
        
        case "users":

            //{"users":{userId1:"name1", userId2:"name2", userId3:"name3", ... }
            var numUsers: number = Object.keys(data).length;
            lastInRoom(numUsers === 1);

            updateUsersDisplay(data, myUserId);
    }
}