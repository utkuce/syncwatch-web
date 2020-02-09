import {sendData} from './room'
import {isEqual} from 'lodash';

import videojs from 'video.js'
import 'videojs-youtube'

const getVideoId = require('get-video-id');

const defaultSrc = "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.webm";
var player = videojs("video1", 
  { 
    controls: true,
    preload: 'auto',
    "techOrder": ["html5", "youtube"]
  });

var syncEvents = ["seeked", "play", "pause"]
syncEvents.forEach(function (entry) {
  player.on(entry, function () {
    console.log(entry + " event")
    videoEvent();
  });
});

setSource(defaultSrc);

function getVideoState() {
  return { 
      "videoState": { 
          "position": Math.floor(player.currentTime()), 
          "paused": player.paused()
      } 
  };
}

var lastEvent : any;
function videoEvent() {
  var event = getVideoState();
  if (!isEqual(event, lastEvent)) { // prevent duplicate events
      lastEvent = event;
      console.log("video event: " + JSON.stringify(event));
      sendData(event);
  }
}

export function setPause(value: boolean) {
  value ? player.pause() : player.play();
}

export function seekTo(seconds: number) {
  player.currentTime(seconds);
}

export function sourceInput() {
  const sourceInput = <HTMLInputElement> document.getElementById('sourceInput');
  setSource(sourceInput.value);
  sendData({"sourceURL": sourceInput.value});
}

export function setSource(sourceURL: string) {

  // The URL of the media file (or YouTube/Vimeo URL).
  var provider: string = 'video/mp4';
  if (getVideoId(sourceURL).service === "youtube")
    provider = 'video/youtube';
  
  player.src({
    type: provider,
    src: sourceURL
  });

  console.log("video source is set to " + sourceURL);
  setPause(true);
  seekTo(1);
  
}

//import * as torrenthandler from '../core/torrenthandler'
/*
export function start(sourceURL: string) {

  if (sourceURL.startsWith("magnet:")) {

    console.log("Received magnet link, forwarding to torrent handler");
    //torrenthandler.start(url);

  } else {

    console.log("Starting video player with source url: " + sourceURL);
    appRef.current?.load(sourceURL);
  }
}

export function setSource(sourceURL: string, sendToPeer: boolean = true) {

  var currentSource : string = sourceURL.trim();
  if (currentSource.startsWith("%HOMEPATH%") && process.env.HOMEPATH) {
    console.log("Expanding variable %HOMEPATH%");
    currentSource = currentSource.replace("%HOMEPATH%", process.env.HOMEPATH);
  }

  //tui.setVideoSource(currentSource);

  if (sendToPeer) {
    room.sendData({ "sourceURL": currentSource});
  }

  start(currentSource);
}
*/