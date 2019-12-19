console.log("Starting syncwatch");

var videoPlayer = require('./videoplayer.js');
var peers = require("./peers");

// if started with a join link join a room
if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch://")) {
    
    roomId = process.argv[2].substring("syncwatch://".length);
    peers.join(roomId);

  }

} else { // else create your own room

  peers.createRoom();
  //process.exit();
}

// get video source from standard input
console.log("Paste a direct link to a video or a magnet link:");
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    videoPlayer.start(line);
    videoPlayer.setSource(line);
});