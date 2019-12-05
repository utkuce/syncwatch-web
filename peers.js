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

var peer1 = new SimplePeer({ initiator: true, wrtc: wrtc });
var peer2 = new SimplePeer({ wrtc: wrtc });


var myPeerInfo = {};
var index = 0;

var uniqid = require('uniqid');
const uniqueKey = uniqid();

peer1.on('signal', data => {
      
    // when peer1 has signaling data, give it to peer2 somehow
    peer2.signal(data);

    myPeerInfo[index] = data;
    index++;

    console.log("Creating firebase entry with key: " + uniqueKey);
    firebase.database().ref("rooms/" + uniqueKey + "/peer1/").set(myPeerInfo);
});

peer2.on('signal', data => {
  // when peer2 has signaling data, give it to peer1 somehow
  peer1.signal(data);
})
 
peer1.on('connect', () => {
  // wait for 'connect' event before using the data channel
  peer1.send('hey peer2, how is it going?');
});
 
peer2.on('data', data => {
  // got a data channel message
  console.log('got a message from peer1: ' + data);
});