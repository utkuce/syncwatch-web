import * as tui from './tui'

const mpvAPI = require('node-mpv');
const mpvPlayer = new mpvAPI();

var firstStart = true;
mpvPlayer.on('started', function() {

  if (firstStart) {
    setPause(true);
    setPosition(0);
  }
  
});

import * as room from '../core/room'

mpvPlayer.on('paused', function() {

  if (!firstStart) { // dont send the first pause event

    mpvPlayer.getProperty("time-pos").then(function(value: number) {

      console.log("video paused, position: " + value);
      var event = { "videoState": { "position": value, "paused": true } };
      room.sendData(event);

    });
  }

  firstStart = false;

});

mpvPlayer.on('resumed', function() {

  mpvPlayer.getProperty("time-pos").then(function(value: number) {
      
    console.log("video resumed, position: " + value);
    var event = { "videoState": { "position": value, "paused": false } };
    room.sendData(event);

  });

});

mpvPlayer.on('seek', function(timeposition: any) {

  mpvPlayer.getProperty("pause").then(function(value: boolean) {
        
    console.log("video position changed: " + timeposition.end);
    var event = { "videoState": { "position": timeposition.end, "paused": value } };
    room.sendData(event);
      
  });

});

import * as torrenthandler from '../core/torrenthandler'

export function start(url: string) {

  if (url.startsWith("magnet:")) {

    console.log("Received magnet link, forwarding to torrent handler");
    torrenthandler.start(url);

  } else {

    console.log("Starting video player with source url: " + url);
    mpvPlayer.load(url);

  }
}

export function setSource(sourceURL: string, sendToPeer: boolean = true) {

  var currentSource : string = sourceURL.trim();
  if (currentSource.startsWith("%HOMEPATH%") && process.env.HOMEPATH) {
    console.log("Expanding variable %HOMEPATH%");
    currentSource = currentSource.replace("%HOMEPATH%", process.env.HOMEPATH);
  }

  tui.setVideoSource(currentSource);

  if (sendToPeer) {
    room.sendData({ "sourceURL": currentSource});
  }

  start(currentSource);
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

