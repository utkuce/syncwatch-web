var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
 
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyB2sMd7L_8oJnU4e1xaweqBR_UyQlRoxrM",
    authDomain: "syncwatch-539db.firebaseapp.com",
    databaseURL: "https://syncwatch-539db.firebaseio.com",
    projectId: "syncwatch-539db",
    storageBucket: "syncwatch-539db.appspot.com",
    messagingSenderId: "917047984813",
    appId: "1:917047984813:web:c8263931b4178a1f6dbc24"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


var SimplePeer = require('simple-peer');
var wrtc = require('wrtc');

var remotePeer; // TODO: make it an array for one to many connection

var uniqid = require('uniqid');
const myPeerId = uniqid('peer-');
process.title = "Connecting as " + myPeerId;

exports.createRoom = function() {

    const roomId = uniqid('room-');

    remotePeer = new SimplePeer(
        { initiator: true, 
            trickle:false ,  
            wrtc: wrtc,
            config: { 
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }, 
                    { urls: 'stun:global.stun.twilio.com:3478?transport=tcp' }
                ] 
            }
        });

    var roomLink = "syncwatch://" + roomId;
    console.log("Creating room");
    console.log("Join link: " + roomLink);

    require("./videoplayer.js").childProcess.stdin.write("room_link:" + roomLink + "\n");

    
    remotePeer.on('signal', data => {

        //console.log('SIGNAL', JSON.stringify(data));
    
        // add yourself to the room with your signaling data
        firebase.database().ref(roomId + "/" + myPeerId).push(data);
        // and attempt to read others' signaling data
        readPeerSignals(roomId);
    });
    
    remotePeer.on('connect', () => {

        remotePeer.send(JSON.stringify({'info': 'Connection established'}));
        
        // wait for 'connect' event before using the data channel
        console.log("Connected to peer");
        //remotePeer.send('hey, how is it going?');
    });

    remotePeer.on('data', data => {
        // got a data channel message
        console.log('got a message: ' + data);
        handleReceived(data);
    });
}

exports.join = function(roomId) {

    remotePeer = new SimplePeer({ wrtc: wrtc , trickle: false});

    console.log("Joining room: " + roomId);
    console.log("Reading signal data of peers in the room");
    
    // and add yourself to the room with your signaling data
    remotePeer.on('signal', data => {
 
        //peer2.signal(data);
        // adding it to the database acts as signaling assuming other peer 
        // will read it immediately and call signal on itself
        firebase.database().ref(roomId + "/" + myPeerId).push(data);  
    });

    remotePeer.on('data', data => {
        // got a data channel message
        console.log('got a message: ' + data);
        handleReceived(data);
    });

    // Read initiator's signal data
    readPeerSignals(roomId);
}

function readPeerSignals(roomId) {

    var roomRef = firebase.database().ref(roomId);
    roomRef.on("child_added", function(peer, prevChildKey) {
        
        
        console.log("Child added for " + peer.key);
        //console.log(peer.val());

        // for each peer in the room get signaling data unless the peer is yourself
        if (peer.key !== myPeerId) {

            //console.log(peer.val());
            // signaling data comes as json array
            peer.forEach(function(signalData) { 
                console.log("Adding signaling data for " + peer.key);
                //console.log(signalData.val() , "\n");
                remotePeer.signal(signalData.val()); 

                videoPlayer.childProcess.stdin.write("new_peer:" + peer.key + "\n");
            });  
        } else {
            console.log("Its own signal data, ignoring...");
            videoPlayer.childProcess.stdin.write("peer_me:" + peer.key + "\n");
        }

    });
}

exports.sendData = function(data) {

    console.log("Sending data: " + data);
    remotePeer.send(data);
}

var videoPlayer = require('./videoplayer.js');

function handleReceived(data) {

    var message = JSON.parse(data);
    var messageType = Object.keys(message)[0];

    switch (messageType) {

        case "videoState":

            // { "videoState": { "position": vid.currentTime, "paused": vid.paused } }

            videoPlayer.setPause(message["videoState"]["paused"]);
            videoPlayer.setPosition(parseFloat(message["videoState"]["position"]));

            //videoPlayer.setListenEvents(true);

            break;

        case "sourceURL":

            // { "sourceURL": url}
            videoPlayer.start(message["sourceURL"]);
            
            break;

    }
}