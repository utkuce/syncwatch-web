import {sendData} from './room'
import {isEqual} from 'lodash';

const video = <HTMLVideoElement> document.getElementById('video');
//video.src = "http://clips.vorwaerts-gmbh.de/big_buck_bunny.webm";

var stateEvents = ["seeked", "play", "pause"]
stateEvents.forEach(function (entry) {
    video.addEventListener(entry, videoEvent);
});

function getVideoState() {
    return { 
        "videoState": { 
            "position": video?.currentTime.toFixed(1), 
            "paused": video?.paused 
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
    value ? video?.pause() : video?.play();
}

export function seekTo(seconds: number) {
    if (video) video.currentTime = seconds;
}

export function sourceInput() {
  const sourceInput = <HTMLInputElement> document.getElementById('sourceInput');
  setSource(sourceInput.value);
  sendData({"sourceURL": sourceInput.value});
}

export function setSource(sourceURL: string) {
  if (video) {
    video.src = sourceURL;
    console.log("video source is set to " + video.src);
  }
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