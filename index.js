console.log("Starting syncwatch");

var videoPlayer = require('./videoplayer.js');
var peers = require("./peers");

// if started with a join link join a room
if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch://")) {
    
    roomId = process.argv[2].substring("syncwatch://".length);
    peers.join(roomId);

  }

  if (process.argv[2].startsWith("magnet:")) {
    peers.createRoom();
    videoPlayer.start(process.argv[2]);
  }

} else { // else create your own room

  peers.createRoom();

  //process.exit();
}