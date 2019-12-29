const mpvAPI = require('node-mpv');
const mpvPlayer = new mpvAPI({
  binary: './gui/bin/syncwatchUI.exe',
  socket: "\\\\.\\pipe\\syncwatch-socket",
  ipc_command: "--input-ipc-server", // prevents the --version call and ui exe hanging
});

exports.setTorrentInfo = function(name, progress, speed, time, peers) {
  mpvPlayer.command("script-message", [
    "torrentInfo", String(name), String(progress), String(speed), String(time), String(peers)]);
}

exports.setRoomInfo = function(roomLink) {
  mpvPlayer.command("script-message", ["roomLink", String(roomLink)]);
}

var firstStart = true;
mpvPlayer.on('started', function(status) {

  if (firstStart) {
    mpvPlayer.pause();
  }
  
});

var peers = require("./peers");

function videoStateEquals(first, second) {
  return first !== undefined && second != undefined && 
    first["videoState"]["paused"] === second["videoState"]["paused"] &&
    first["videoState"]["position"] === second["videoState"]["position"];
}

var lastReceivedEvent;
exports.setLastReceivedEvent = function(message) {
  lastReceivedEvent = message;
};

var currentSource = "";
exports.getCurrentSource = function() {
  return currentSource;
}

exports.setTitle = function(value) {
  mpvPlayer.setProperty("title", value);
}

mpvPlayer.on('stopped', function(){
  console.log("mpv stopped");
  //process.exit();
});

mpvPlayer.on('paused', function() {

  if (!firstStart) { // dont send the first pause event

    mpvPlayer.getProperty("time-pos").then(function(value) {

      lastPosEvent = value;
      console.log("video paused, position: ", value);

      var event = { "videoState": { "position": value, "paused": true } };
/*      
      console.log("event: " + JSON.stringify(event));
      console.log("lastReceivedEvent: " + JSON.stringify(lastReceivedEvent));
      console.log("eq: ", videoStateEquals(event,lastReceivedEvent));
*/
      if (!videoStateEquals(event,lastReceivedEvent)) {
        peers.sendData(JSON.stringify(event));
      }

    });
  }

  firstStart = false;

});

mpvPlayer.on('resumed', function() {


  mpvPlayer.getProperty("time-pos").then(function(value) {
      
      console.log("video resumed, position: ", value);

      var event = { "videoState": { "position": value, "paused": false } };
/*     
      console.log("event: " + JSON.stringify(event));
      console.log("lastReceivedEvent: " + JSON.stringify(lastReceivedEvent));
      console.log("eq: ", videoStateEquals(event,lastReceivedEvent));
*/
      if (!videoStateEquals(event,lastReceivedEvent)) {
        peers.sendData(JSON.stringify(event));
      }
    
    });

});

var lastSeekEvent =  "";
mpvPlayer.on('seek', function(timeposition) {

  if (lastSeekEvent != timeposition.end) { // prevent duplicate events

    mpvPlayer.getProperty("pause").then(function(value) {
        
      console.log("video position changed: ", timeposition.end);

      var event = { "videoState": { "position": timeposition.end, "paused": value } };
/*      
      console.log("event: " + JSON.stringify(event));
      console.log("lastReceivedEvent: " + JSON.stringify(lastReceivedEvent));
      console.log("eq: ", videoStateEquals(event,lastReceivedEvent));
*/
      if (!videoStateEquals(event,lastReceivedEvent)) {
        peers.sendData(JSON.stringify(event));
      }
      
    });
    
  }

  lastSeekEvent = timeposition.end;

});

var torrentHandler = require('./torrenthandler.js');
function start(url) {

    if (url.startsWith("magnet:")) {

      console.log("Received magent link, forwarding to torrent handler");
      torrentHandler.start(url);

    } else {

      console.log("Starting video player with source url: " + url);
      console.log("Please wait...");
      mpvPlayer.load(url);

    }
}

exports.start = start;

exports.setSource = function(sourceURL) {

  currentSource = sourceURL;
  start(sourceURL);

  // send video url to peer
  // if connected
  //peers.sendData(JSON.stringify({ "sourceURL": sourceURL}));
}

exports.setPause = function(paused) {

  listenPauseEvents = false;
  paused ? mpvPlayer.pause() : mpvPlayer.play();
}

exports.setPosition = function(position) {
  
  listenPositionEvents = false;
  mpvPlayer.goToPosition(position);
}