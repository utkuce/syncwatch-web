import {sendData, eventCooldown} from './room'
import {isEqual} from 'lodash';

import Plyr from 'plyr';

import VTTConverter from 'srt-webvtt';

const getVideoId = require('get-video-id');

const defaultSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const player = new Plyr('#video1', {
  invertTime:false,
  keyboard: { focused: true, global: true },
  settings: []
});

var syncEvents = ["seeked", "play", "pause"]
syncEvents.forEach(function (entry: any) {
  player.on(entry, function () {
    console.log(entry + " event")
    videoEvent();
  });
});

setSource(defaultSrc);

var currentProvider : string;
function getVideoState() {

  // youtube player needs low precision to sync correctly
  var position_ = player.currentTime;
  if ( currentProvider === "youtube") 
    position_ = Math.floor(position_);

  return { 
      "videoState": { 
          "position": position_, 
          "paused": player.paused
      } 
  };
}

var lastEvent : any;
function videoEvent() {
  var event = getVideoState();
  if (!isEqual(event, lastEvent)) { // prevent duplicate events
      lastEvent = event;
      console.log("video event: " + JSON.stringify(event));
      if (!eventCooldown)
        sendData(event);
  }
}

export function setPause(value: boolean) {

  if (value === true) {
    player.pause();
  } else {

    var playPromise = player.play();
    if (playPromise !== undefined) {

      playPromise.then(function() {

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
  player.currentTime = seconds;
}

export function sourceInput() {
  const sourceInput = <HTMLInputElement> document.getElementById('sourceInput');
  setSource(sourceInput.value);
  sendData({"sourceURL": sourceInput.value});
}

export function setSource(sourceURL: string) {

  // The URL of the media file (or YouTube/Vimeo URL).
  var provider_ = getVideoId(sourceURL).service;
  var src_ = sourceURL;

  if (provider_ === undefined)
    provider_ = "html5";

  player.source = {
    type: 'video',
    sources : [
      {
        provider: provider_,
        src: src_
      }
    ]
  };

  currentProvider = provider_;
  console.log("Video source is set to " + src_ + " (provider: " + provider_ + ")"); 
}


/*
var fileSelector  = document.getElementById('fileSelector');
fileSelector?.addEventListener('change', handleFileSelect, false)

function handleFileSelect (evt : any) {

  var files = evt.target.files // FileList object
  var videoFile = files[0];

  setSource(URL.createObjectURL(videoFile));
}
/*
var subNumber = 1;
export function addSubtitleFile(file: File, ext: string) {

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
  vjs_player.addRemoteTextTrack({ 
    src: url, 
    kind: "subtitles", 
    label: "subtitle" + subNumber++, 
    mode: "showing" 
  }, false);
}*/