const { spawn } = require('child_process');
const childProcess = spawn('./gui/bin/syncwatchUI.exe');
exports.childProcess = childProcess;

childProcess.stdin.setEncoding('utf-8');
//childProcess.stdout.pipe(process.stdout);

childProcess.stdout.on('data', function (data) {

  //console.log("Data from ui child process:" + data);

  data = String(data);
  if (data.startsWith('source:')) {
    start(data.substring('source:'.length));
  }

});

const mpvAPI = require('node-mpv');
const mpvPlayer = new mpvAPI();

var firstStart = true;
mpvPlayer.on('started', function(status) {

  if (firstStart) {

    mpvPlayer.goToPosition(0);
    mpvPlayer.pause();

    firstStart = false;
  }

});

var peers = require("./peers");

var listenPauseEvents = true;
var listenPositionEvents = true;

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

  if (listenPositionEvents && listenPositionEvents) {

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
      torrentHandler.start(url);
    } else {

      console.log("Starting video player with source url: " + url);
      console.log("Please wait...");
      //mpvPlayer.load(url);


      childProcess.stdin.write("url:http://localhost:8000/0\n");
      //child.stdin.end(); 
    }
}

exports.start = start;

exports.setSource = function(sourceURL) {
  mpvPlayer.load(sourceURL);
  // send video url to peer
  peers.sendData(JSON.stringify({ "sourceURL": sourceURL}));
}

exports.setPause = function(paused) {

  listenPauseEvents = false;
  paused ? mpvPlayer.pause() : mpvPlayer.play()
}

exports.setPosition = function(position) {
  
  listenPositionEvents = false;
  mpvPlayer.goToPosition(position);
}