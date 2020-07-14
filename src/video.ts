// ****************************************************************************
// functions related to the video player events and controling the video player
// ****************************************************************************

import {sendVideoState} from './sync'
import * as ui from './interface'
import * as webtorrent from './webtorrent'

import Plyr from 'plyr';

const player = new Plyr('#video1', {
  invertTime:false,
  keyboard: { focused: true, global: true },
  speed: {selected: 1, options:[]},
  ratio: "16:9"
});

var syncEvents = ["seeked", "play", "pause"]
syncEvents.forEach(function (entry: any) {
  player.on(entry, function () {
    sendVideoState(player.paused, player.currentTime);
  });
});

var videoReady = false;
player.on("ready", ()=>{
  console.log("Player ready");
  videoReady = true;
})

const defaultSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
setSource(defaultSrc);

export async function setPause(value: boolean) {
  
  await until((_: any) => videoReady);

  console.log("setPause " + value);
  var playPromise = value? player.pause() : player.play();
  if (playPromise && value) {
    ui.autoPlayWarning(playPromise);
  }
}

var firstPlay: boolean = true;
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
  var provider_ = require('get-video-id')(sourceURL).service;
  var src_ = sourceURL;

  if (provider_ === undefined)
    provider_ = "html5";

  if (sourceURL.startsWith("magnet:")) {
    webtorrent.handleTorrent(sourceURL);
  } else {
    player.source = {
      type: 'video',
      sources : [
        {
          provider: provider_,
          src: src_
        }
      ]
    };
  }

  ui.setVideoSourceDisplay(src_, provider_);
}