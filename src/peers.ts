import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

import * as videoplayer from './videoplayer';
import config from './config';

import * as tui from './tui'

// Initialize Firebase
firebase.initializeApp(config.firebase);

var SimplePeer = require('simple-peer');
var wrtc = require('wrtc');

var remotePeer : any; // TODO: make it an array for one to many connection
var connected : boolean = false;

var uniqid = require('uniqid');
const myPeerId = uniqid('peer-');
process.title = "Connecting as " + myPeerId;

export var roomLink: string = "not_set";
export function createRoom() {

    const roomId = uniqid('room-');

    remotePeer = new SimplePeer(
        { initiator: true, 
            trickle:false ,  
            wrtc: wrtc,
            config: { 
                iceServers: config.iceServers
            }
        });

    roomLink = "syncwatch://" + roomId;
    tui.setRoomLink(roomLink);
 
    tui.addDebugInfo("Creating room");
    tui.addDebugInfo("Join link: " + roomLink);

    //videoplayer.setRoomInfo(roomLink);
    
    remotePeer.on('signal', (data: string) => {

        //tui.addDebugInfo('SIGNAL', JSON.stringify(data));
    
        // add yourself to the room with your signaling data
        firebase.database().ref(roomId + "/" + myPeerId).push(data, 
            
            function(error: any){
                if (error) {
                    console.error(error)
                    return
                }
                tui.addDebugInfo('Room added to firebase database')
                setNewPeer(myPeerId + " (you)");
            }
        );

        // and attempt to read others' signaling data
        readPeerSignals(roomId);
    });
    
    remotePeer.on('connect', () => {

        connected = true;

        if (videoplayer.getCurrentSource() !== "")
            remotePeer.send(JSON.stringify({ "sourceURL": videoplayer.getCurrentSource()}));
        
        // wait for 'connect' event before using the data channel
        tui.addDebugInfo("Connected to peer");
        //remotePeer.send('hey, how is it going?');
    });

    remotePeer.on('data', (data: string) => {
        // got a data channel message
        tui.addDebugInfo('got a message: ' + data);
        handleReceived(data);
    });

    return roomLink;
}

export function join(roomId: string) {

    remotePeer = new SimplePeer({ wrtc: wrtc , trickle: false});

    tui.addDebugInfo("Joining room: " + roomId);
    roomLink = "syncwatch://" + roomId;
    tui.addDebugInfo("Reading signal data of peers in the room");
    
    // and add yourself to the room with your signaling data
    remotePeer.on('signal', (data: string) => {
 
        //peer2.signal(data);
        // adding it to the database acts as signaling assuming other peer 
        // will read it immediately and call signal on itself
        firebase.database().ref(roomId + "/" + myPeerId).push(data, 
            
            function(error: any){
                if (error) {
                    console.error(error)
                    return
                }
                tui.addDebugInfo('Own peer id added to firebase database')
                setNewPeer(myPeerId + " (you)");
            }
        );
    });

    remotePeer.on('connect', () => {
        
        connected = true;
        // wait for 'connect' event before using the data channel
        tui.addDebugInfo("Connected to peer");
        //remotePeer.send('hey, how is it going?');
    });

    remotePeer.on('data', (data: string) => {
        // got a data channel message
        tui.addDebugInfo('got a message: ' + data);
        handleReceived(data);
    });

    // Read initiator's signal data
    readPeerSignals(roomId);
}

function readPeerSignals(roomId: string) {

    var roomRef = firebase.database().ref(roomId);
    roomRef.on("child_added", function(peer: any, prevChildKey: any) {
        
        
        tui.addDebugInfo("Child added for " + peer.key);
        //tui.addDebugInfo(peer.val());

        // for each peer in the room get signaling data unless the peer is yourself
        if (peer.key !== myPeerId) {

            //tui.addDebugInfo(peer.val());
            // signaling data comes as json array
            peer.forEach(function(signalData: any) { 
                tui.addDebugInfo("Adding signaling data for " + peer.key);
                //tui.addDebugInfo(signalData.val() , "\n");
                remotePeer.signal(signalData.val()); 

                setNewPeer(peer.key);

            });  
        } else {
            tui.addDebugInfo("Its own signal data, ignoring...");
        }

    });
}

exports.sendData = function(data: string) {

    if (connected) {
        tui.addDebugInfo("Sending data: " + data);
        remotePeer.send(data);
    } else {
        tui.addDebugInfo("Did not send sync data because peer is not connected");
    }
}


function handleReceived(data: string) {

    var message = JSON.parse(data);
    var messageType = Object.keys(message)[0];

    switch (messageType) {

        case "videoState":

            // { "videoState": { "position": vid.currentTime, "paused": vid.paused } }
            videoplayer.setLastReceivedEvent(message);

            videoplayer.setPause(message["videoState"]["paused"]);
            videoplayer.setPosition(parseFloat(message["videoState"]["position"]));


            break;

        case "sourceURL":

            // { "sourceURL": url}
            videoplayer.start(message["sourceURL"]);
            
            break;

    }
}

function setNewPeer(peerInfo: string) {
    tui.addNewPeer(peerInfo);
}