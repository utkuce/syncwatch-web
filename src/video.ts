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

var videoReady = false;
player.on("ready", ()=>{
  console.log("Player ready");
  videoReady = true;
})

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

export async function setPause(value: boolean) {
  
  await until((_: any) => videoReady);

  console.log("setPause " + value);
  var playPromise = value? player.pause() : player.play();
  if (playPromise && value) {
    ui.autoPlayWarning(playPromise);
  }
}

export async function seekTo(seconds: number) {
    
  await until((_: any) => videoReady);
  
  console.log("Seeking to " + seconds);
  player.currentTime = seconds;

  // workaround for youtube getting muted when .play() is called 
  // after .currentTime for the first time
  // see https://github.com/sampotts/plyr/issues/1527
  if (firstPlay) {
    player.muted = false;
    firstPlay = false;
  }
}

function until(conditionFunction: Function) {

  const poll = (resolve: () => any) => {
    if(conditionFunction()) resolve();
    else setTimeout((_: any) => poll(resolve), 50);
  }

  return new Promise(poll);
}

export function setSource(sourceURL: string) {

  videoReady = false;
  firstPlay = true;

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