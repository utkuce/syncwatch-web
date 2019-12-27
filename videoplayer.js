const mpvAPI = require('node-mpv');
const mpvPlayer = new mpvAPI({
  binary: './gui/bin/syncwatchUI.exe',
  socket: "\\\\.\\pipe\\syncwatch-socket",
  ipc_command: "--input-ipc-server", // prevents the --version call and ui exe hanging
});

var firstStart = true;
mpvPlayer.on('started', function(status) {

  if (firstStart) {
    mpvPlayer.pause();
  }
  
});

var peers = require("./peers");

var listenPauseEvents = true;
var listenPositionEvents = true;

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

  if (listenPauseEvents && !firstStart) {

    mpvPlayer.getProperty("time-pos").then(function(value) {

      lastPosEvent = value;
      console.log("video paused, position: ", value);
      peers.sendData(JSON.stringify({ "videoState": { "position": value, "paused": true } }));
    });
  }
  else
  {
    console.log("listenPauseEvents: " + listenPauseEvents + " , firstStart: " + firstStart);
  }

  listenPauseEvents = true;
  firstStart = false;

});

mpvPlayer.on('resumed', function() {

  if (listenPauseEvents) {

    mpvPlayer.getProperty("time-pos").then(function(value) {
      console.log("video resumed, position: ", value);
      peers.sendData(JSON.stringify({ "videoState": { "position": value, "paused": false } }));
    });
  }

  listenPauseEvents = true;

});

var lastSeekEvent =  "";
mpvPlayer.on('seek', function(timeposition) {

  if (lastSeekEvent != timeposition.end) { // prevent duplicate events

    if (listenPositionEvents) {

      mpvPlayer.getProperty("pause").then(function(value) {
        console.log("video position changed: ", timeposition.end);
        peers.sendData(JSON.stringify({ "videoState": { "position": timeposition.end, "paused": value } }));
      });
    }
  }

  lastSeekEvent = timeposition.end;
  listenPositionEvents = true;

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

      //childProcess.stdin.write("url:" + url + "\n");
      //child.stdin.end(); 
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