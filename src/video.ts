import {sendData} from './room'
import {isEqual} from 'lodash';

import videojs from 'video.js'
import 'videojs-youtube'

const getVideoId = require('get-video-id');

const defaultSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
var player = videojs("video1", 
  { 
    controls: true,
    preload: 'auto',
    "fluid": true,
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

  if (value) {
    player.pause();
  } else {

    var promise = player.play();
    if (promise !== undefined) {

      promise.then(function() {

        const autoplay_warning = document.getElementById("autoplay_warning");
        if(autoplay_warning)
          autoplay_warning.setAttribute("style", "display: none;")
    
      }).catch(function(error) {
        
        const autoplay_warning = document.getElementById("autoplay_warning");
        if(autoplay_warning)
          autoplay_warning.setAttribute("style", "display: block; color:white; text-align: center;")
    
      });
    }
  }
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

var fileSelector  = document.getElementById('fileSelector');
fileSelector?.addEventListener('change', handleFileSelect, false)

function handleFileSelect (evt : any) {

  var files = evt.target.files // FileList object
  var videoFile = files[0];

  setSource(URL.createObjectURL(videoFile));
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