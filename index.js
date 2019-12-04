console.log("Starting syncwatch");

var torrentHandler = require('./torrenthandler.js');
var videoPlayer = require('./videoplayer.js');
var peers = require("./peers");

if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch://")) {
    inputURL = process.argv[2].substring("syncwatch://".length);
  }else if (process.argv[2].startsWith("syncwatch:")) {
    inputURL = process.argv[2].substring("syncwatch:".length);
  } else {
    inputURL = process.argv[2];
  }

  if (inputURL.startsWith("magnet:")) {

    torrentHandler.start(inputURL);

  } else {

    // not a magnet link url
    videoPlayer.start(inputURL);
  }

} else {

  console.log("Paste a direct link to a video or a magnet link:");
  var readline = require('readline');
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', function(line){
      videoPlayer.start(line);
  });
  
  //process.exit();
}