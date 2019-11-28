console.log("Starting syncwatch");

var torrentHandler = require('./torrenthandler.js');
var videoPlayer = require('./videoplayer.js');

if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch:")) {
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
  console.log("No source provided, quitting");
  process.exit();
}