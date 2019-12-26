const mpvAPI = require('node-mpv');
const mpvPlayer = new mpvAPI({
  //binary: './gui/bin/syncwatchUI.exe',
  //socket: "\\\\.\\pipe\\syncwatch-socket",
  auto_restart: false
});

var firstStart = true;
mpvPlayer.on('started', function(status) {

  if (firstStart) {

    listenPositionEvents = false;
    mpvPlayer.goToPosition(0);

    listenPauseEvents = false;
    mpvPlayer.pause();

    firstStart = false;

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

mpvPlayer.on('statuschange', function(status){
  //console.log(status);
});

mpvPlayer.on('paused', function() {

  if (listenPauseEvents && listenPositionEvents) {

    mpvPlayer.getProperty("time-pos").then(function(value) {
      console.log("video paused, position: ", value);
      peers.sendData(JSON.stringify({ "videoState": { "position": value, "paused": true } }));
    });
  }

  listenPauseEvents = true;

});

mpvPlayer.on('resumed', function() {

  if (listenPauseEvents && listenPositionEvents) {

    mpvPlayer.getProperty("time-pos").then(function(value) {
      console.log("video resumed, position: ", value);
      peers.sendData(JSON.stringify({ "videoState": { "position": value, "paused": false } }));
    });
  }

  listenPauseEvents = true;

});

mpvPlayer.on('seek', function(timeposition) {

  if (listenPauseEvents && listenPositionEvents) {

    mpvPlayer.getProperty("pause").then(function(value) {
      console.log("video position changed: ", timeposition.end);
      peers.sendData(JSON.stringify({ "videoState": { "position": timeposition.end, "paused": value } }));
    });
  }

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
  paused ? mpvPlayer.pause() : mpvPlayer.play()
}

exports.setPosition = function(position) {
  
  listenPositionEvents = false;
  //childProcess.stdin.write("position:" + position + "\n");
  mpvPlayer.goToPosition(position);
}