import * as tui from './tui'

const mpvAPI = require('node-mpv');
const mpvPlayer = new mpvAPI();

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
  tui.addDebugInfo("Player quit");
  process.exit();
});

var lastEventSent: Object;

mpvPlayer.on('paused', function() {

  if (!firstStart) { // dont send the first pause event

    mpvPlayer.getProperty("time-pos").then(function(value: number) {

      tui.addDebugInfo("video paused, position: " + value);
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


  mpvPlayer.getProperty("time-pos").then(function(value: number) {
      
    tui.addDebugInfo("video resumed, position: " + value);
    var event = { "videoState": { "position": value, "paused": false } };

    // dont send back received event and prevent duplicates
    if (!videoStateEquals(event,lastReceivedEvent) && !videoStateEquals(event,lastEventSent)) {
      peers.sendData(JSON.stringify(event));
      lastEventSent = event;
    }
    
  });

});

mpvPlayer.on('seek', function(timeposition: any) {


  mpvPlayer.getProperty("pause").then(function(value: boolean) {
        
    tui.addDebugInfo("video position changed: " + timeposition.end);
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

    tui.addDebugInfo("Received magent link, forwarding to torrent handler");
    torrenthandler.start(url);

  } else {

    tui.addDebugInfo("Starting video player with source url: " + url);
    mpvPlayer.load(url);

  }
}

export function setSource(sourceURL: string) {

  currentSource = sourceURL;
  tui.setVideoSource(sourceURL);

  // send video url to peer
  if (peers.connected)
    peers.sendData(JSON.stringify({ "sourceURL": sourceURL}));
  else 
    tui.addDebugInfo("Did not send source url because peer is not connected");

  start(sourceURL);
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

