// ****************************************************************************
// functions related to the video player events and controling the video player
// ****************************************************************************

import {sendData, eventCooldown} from './sync'
import * as ui from './interface'
import {isEqual} from 'lodash';

import Plyr from 'plyr';

const getVideoId = require('get-video-id');

const defaultSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const player = new Plyr('#video1', {
  invertTime:false,
  keyboard: { focused: true, global: true },
  speed: {selected: 1, options:[]},
  ratio: "16:9"
});

var syncEvents = ["seeked", "play", "pause"]
var firstPlay: boolean = true;

syncEvents.forEach(function (entry: any) {
  
  player.on(entry, function () {
    console.log(entry + " event")
    videoEvent();
  });
});

setSource(defaultSrc);

function getVideoState() {

  return { 
      "videoState": { 
          "position": player.currentTime + ":" + Date.now(), 
          "paused": player.paused
      } 
  };
}

var lastEvent : any;
function videoEvent() {

  var event = getVideoState();
  
  // filter duplicate events coming from the video player
  if (!isEqual(event, lastEvent)) {
      lastEvent = event;
      console.log("video event: " + JSON.stringify(event));
      if (!eventCooldown)
        sendData(event);
  }
}

export function setPause(value: boolean) {

  // workaround for youtube getting muted after .play() is called for the first time
  if (firstPlay) {
    player.muted = false; 
    firstPlay = false;
  }

  var playPromise = value? player.pause() : player.play();
  if (playPromise) {
    ui.autoPlayWarning(playPromise);
  }
}

export function seekTo(seconds: number) {
  console.log("Seeking to " + seconds);
  player.currentTime = seconds;
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

  ui.setVideoSourceDisplay(src_, provider_);
}