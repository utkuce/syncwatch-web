import {sendData} from './room'
import {isEqual} from 'lodash';

import videojs from 'video.js'
import 'videojs-youtube'
import VTTConverter from 'srt-webvtt';

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
  else if (sourceURL.endsWith(".m3u8"))
    provider = "application/x-mpegURL";
  
  player.src({
    type: provider,
    src: sourceURL
  });

  console.log("video source is set to " + sourceURL); 
}

var fileSelector  = document.getElementById('fileSelector');
fileSelector?.addEventListener('change', handleFileSelect, false)

function handleFileSelect (evt : any) {

  var files = evt.target.files // FileList object
  var videoFile = files[0];

  setSource(URL.createObjectURL(videoFile));
}

var subNumber = 1;
export function addSubtitles(file: File, ext: string) {

  console.log("Subtitle file added: " + file.name);

  if (ext === "srt") {
    const vttConverter = new VTTConverter(file);
    vttConverter.getURL().then(function(url) { 
  
      addTextTrack(url);
  
    }).catch(function(err) {
      console.error(err);
    });
  } else if (ext === "vtt") {
    addTextTrack(URL.createObjectURL(file));
  }
}

function addTextTrack(url: string) {
  player.addRemoteTextTrack({ 
    src: url, 
    kind: "subtitles", 
    label: "subtitle" + subNumber++, 
    mode: "showing" 
  }, false);
}