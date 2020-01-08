
const mpvAPI = require('node-mpv');
const mpvPlayer = new mpvAPI({
  binary: "mpv.exe"
//  binary: './gui/bin/syncwatchUI.exe',
//  socket: "\\\\.\\pipe\\syncwatch-socket",
//  ipc_command: "--input-ipc-server", // prevents the --version call and ui exe hanging
});
/*
exports.setTorrentInfo = function(name, progress, speed, time, peers) {
  mpvPlayer.command("script-message", [
    "torrentInfo", String(name), String(progress), String(speed), String(time), String(peers)]);
}

exports.setRoomInfo = function(roomLink) {
  mpvPlayer.command("script-message", ["roomLink", String(roomLink)]);
}

exports.setNewPeer = function(peerId, peerName) {
  mpvPlayer.command("script-message", ["newPeer", String(peerId), String(peerName)]);
}
*/

var firstStart = true;
mpvPlayer.on('started', function() {

  if (firstStart) {
    mpvPlayer.pause();
  }
  
});

var peers = require("./peers");

function videoStateEquals(first: any, second: any) {
  return first !== undefined && second != undefined && 
    first["videoState"]["paused"] === second["videoState"]["paused"] &&
    first["videoState"]["position"] === second["videoState"]["position"];
}



mpvPlayer.on('quit', function() {
  console.log("Player quit");
  process.exit();
});

var lastEventSent: Object;

mpvPlayer.on('paused', function() {

  if (!firstStart) { // dont send the first pause event

    mpvPlayer.getProperty("time-pos").then(function(value: Number) {

      console.log("video paused, position: ", value);

      var event = { "videoState": { "position": value, "paused": true } };

      // dont send back received event and prevent duplicates
      if (!videoStateEquals(event,lastReceivedEvent) && !videoStateEquals(event,lastEventSent)) {
        peers.sendData(JSON.stringify(event));
        lastEventSent = event;
      }

    });
  }

  firstStart = false;

});

mpvPlayer.on('resumed', function() {


  mpvPlayer.getProperty("time-pos").then(function(value: Number) {
      
      console.log("video resumed, position: ", value);

      var event = { "videoState": { "position": value, "paused": false } };

      // dont send back received event and prevent duplicates
      if (!videoStateEquals(event,lastReceivedEvent) && !videoStateEquals(event,lastEventSent)) {
        peers.sendData(JSON.stringify(event));
        lastEventSent = event;
      }
    
    });

});

mpvPlayer.on('seek', function(timeposition: any) {


  mpvPlayer.getProperty("pause").then(function(value: Boolean) {
        
    console.log("video position changed: ", timeposition.end);

    var event = { "videoState": { "position": timeposition.end, "paused": value } };

    // dont send back received event and prevent duplicates
    if (!videoStateEquals(event,lastReceivedEvent) && !videoStateEquals(event,lastEventSent)) {
      peers.sendData(JSON.stringify(event));
      lastEventSent = event;
    }
      
  });

});

import * as torrenthandler from './torrenthandler'
var lastReceivedEvent: Object;
var currentSource: string = "";

export function setLastReceivedEvent(message: Object) {
  lastReceivedEvent = message;
};

export function getCurrentSource() {
  return currentSource;
}

export function start(url: string) {

  if (url.startsWith("magnet:")) {

    console.log("Received magent link, forwarding to torrent handler");
    torrenthandler.start(url);

  } else {

    console.log("Starting video player with source url: " + url);
    console.log("Please wait...");
    mpvPlayer.load(url);

  }
}

export function setSource(sourceURL: string) {

  currentSource = sourceURL;
  start(sourceURL);

  // send video url to peer
  // if connected
  //peers.sendData(JSON.stringify({ "sourceURL": sourceURL}));
}

export function setPause(paused: Boolean) {
  paused ? mpvPlayer.pause() : mpvPlayer.play();
}

export function setPosition(position: Number) {
  mpvPlayer.goToPosition(position);
}

export function setTitle(value: string) {
  mpvPlayer.setProperty("title", value);
}

