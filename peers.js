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
var index = 0;

var uniqid = require('uniqid');
const myPeerId = uniqid('peer-');
process.title = "Connecting as " + myPeerId;

exports.createRoom = function() {

    const roomId = uniqid('room-');

    remotePeer = new SimplePeer({ initiator: true, trickle:false ,  wrtc: wrtc });

    console.log("Creating room");
    console.log("Join link: " + "syncwatch://" + roomId);
    
    remotePeer.on('signal', data => {

        //console.log('SIGNAL', JSON.stringify(data));
    
        // add yourself to the room with your signaling data
        firebase.database().ref(roomId + "/" + myPeerId).push(data);
        // and attempt to read others' signaling data
        readPeerSignals(roomId);
    });
    
    remotePeer.on('connect', () => {
        // wait for 'connect' event before using the data channel
        console.log("Connected to peer, sending data");
        remotePeer.send('hey, how is it going?');
    });
}

exports.join = function(roomId) {

    remotePeer = new SimplePeer({ wrtc: wrtc });

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
            });  
        } else {
            console.log("Its own signal data, ignoring...");
        }

    });
}