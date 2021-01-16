// ****************************************************************************
// functions related to the video player events and controling the video player
// ****************************************************************************

import {sendVideoState} from './sync'
import * as ui from './interface'
import * as webtorrent from './webtorrent'

import videojs from 'video.js'
import '@videojs/themes/dist/sea/index.css';
import 'videojs-youtube'

var options = {controls: true, preload: "auto", aspectRatio: "16:9", techOrder: ["html5", "youtube"]};
var player = videojs('my-player', options, function onPlayerReady() {
  videojs.log('Your player is ready!');
});

var syncEvents = ["seeked", "play", "pause"]
syncEvents.forEach(function (entry: any) {
  player.on(entry, function () {
    sendVideoState(player.paused(), player.currentTime());
  });
});

var ready = false;

player.ready(function() {
  console.log("Player ready");
  ready = true;
});

player.on('playing', function() { 
  firstPlay = false;
});

export function showDefaultVideo() {
  const defaultSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  setSource(defaultSrc);
}

export async function setPause(value: boolean) {
  
  if (!ready)
  {
    player.one("ready", function() {
      setPause(value);
    });
    return;
  }

  console.log("setPause " + value);
  var playPromise = value? player.pause() : player.play();
  if (playPromise && value) {
    //ui.autoPlayWarning(playPromise);
  }
}

var firstPlay: boolean = true;
export async function seekTo(seconds: number) {
    
  if (!ready)
  {
    player.one("ready", function() {
      seekTo(seconds);
    });
    return;
  }

  console.log("Seeking to " + seconds);

  if (player.paused() && firstPlay)
    player.one('playing', function(){
      player.currentTime(seconds);
    });
  else
    player.currentTime(seconds);

}

export function setSource(sourceURL: string) {

  firstPlay = true;

  // The URL of the media file (or YouTube/Vimeo URL).
  var provider_ = require('get-video-id')(sourceURL).service;
  var src_ = sourceURL;

  if (provider_ === undefined)
    provider_ = "mp4";

  if (sourceURL.startsWith("magnet:")) {
    webtorrent.handleTorrent(sourceURL);
  } else {
    player.src({type: 'video/' + provider_, src: src_});
  }

  ui.setVideoSourceDisplay(src_, provider_);
}