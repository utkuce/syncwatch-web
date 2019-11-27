console.log("Starting syncwatch");
const WebTorrent = require('webtorrent-hybrid');

var client = new WebTorrent()

if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch:")) {
    inputURL = process.argv[2].substring("syncwatch:".length);
  } else {
    inputURL = process.argv[2];
  }

  if (inputURL.startsWith("magnet:")) {

    var magnetURI = inputURL;

    client.add(magnetURI, function (torrent) {
      // create HTTP server for this torrent
      var server = torrent.createServer();
      server.listen(8000); // start the server listening to a port
    
      var interval = setInterval(function () {
        console.clear();
        console.log("Downloading: " + (torrent.progress * 100).toFixed(1) + "%" 
            + " - " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s "
            + " from " + torrent.numPeers + " peer(s)"
            + " Time left: " + (torrent.timeRemaining/60000).toFixed(2) + " minutes");
    
      }, 1000);
    
      torrent.on("done", function () {
          console.log("File ready.");
          clearInterval(interval);
      });
    
      torrent.on('error', function (err) {
          console.log(err);
      });
    
      // visit http://localhost:<port>/ to see a list of files
    
      // access individual files at http://localhost:<port>/<index> where index is the index
      // in the torrent.files array
    
      startMpvPlayer("http://localhost:8000/0");
       
      // later, cleanup...
    
    
      //server.close();
      //client.destroy();
    
    });

  } else {

    // not a magnet link url
    startMpvPlayer(inputURL);
  }

} else {
  console.log("No source provided, quitting");
  process.exit();
}


function startMpvPlayer(url) {

  const mpvAPI = require('node-mpv');

  // TODO: fix absolute path
  const mpvPlayer = new mpvAPI({"binary" : "C:/Users/utku/Dropbox/workspace/syncwatch-desktop/mpv.exe"});

  console.log("Starting video player with source url: " + url)

  var firstStart = true;
  mpvPlayer.on('started', function(status) {

    if (firstStart) {

      mpvPlayer.goToPosition(0.1);
      mpvPlayer.pause();

      firstStart = false;
    }

  });

  mpvPlayer.on('statuschange', function(status){
    //console.log(status);
  });

  mpvPlayer.on('paused', function(status) {
  
  });

  mpvPlayer.on('resumed', function(status) {
  
  });

  mpvPlayer.on('seek', function(status) {
  
  });

  mpvPlayer.load(url);
  //mpvPlayer.load("https://www.youtube.com/watch?v=KBRU2VkUeh4");

  

  //mpv.volume(70);
}
