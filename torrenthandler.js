const WebTorrent = require('webtorrent-hybrid');
var client = new WebTorrent();

var videoPlayer = require('./videoplayer.js');
var port;
exports.port = port;

exports.start = function(magnetURI) {

    client.add(magnetURI, function (torrent) {
      // create HTTP server for this torrent
      var server = torrent.createServer();

      const getPort = require('get-port'); // random available port

      (async () => {
        port = await getPort();
        console.log("Starting server on port " + port);
        server.listen(port); // start the server listening to a port


        var interval = setInterval(function () {
          //console.clear();
          
          videoPlayer.childProcess.stdin.write("torrent_progress:" + torrent.progress + "\n");
          var speed = (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2);
          videoPlayer.childProcess.stdin.write("download_speed:" + speed + "\n");
          videoPlayer.childProcess.stdin.write("torrent_name:" + torrent.name + "\n");
          videoPlayer.childProcess.stdin.write("torrent_peers:" + torrent.numPeers + "\n");
  
  
          var downloadInfo = torrent.name + " (Downloading: " + (torrent.progress * 100).toFixed(1) + "%" 
          + " - " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s "
          + " from " + torrent.numPeers + " peer(s)"
          + " ETA: " + (torrent.timeRemaining/60000).toFixed(2) + " minutes)";
          
          console.log(downloadInfo);
          videoPlayer.setTitle(downloadInfo);
      
        }, 1000);
      
        torrent.on("done", function () {
  
            videoPlayer.childProcess.stdin.write("torrent_progress:" + 1.0 + "\n");
            videoPlayer.childProcess.stdin.write("download_speed:" + 0 + "\n");
            videoPlayer.childProcess.stdin.write("torrent_name:" + torrent.name + "\n");
  
            console.log(torrent.name + " (Download complete)");
            videoPlayer.setTitle(torrent.name + " (Download complete)");
            clearInterval(interval);
        });
      
        torrent.on('error', function (err) {
            console.log(err);
        });
      
        // visit http://localhost:<port>/ to see a list of files
      
        // access individual files at http://localhost:<port>/<index> where index is the index
        // in the torrent.files array
      
        videoPlayer.start("http://localhost:" + port + "/0"); // TODO: fix video file index
         
        // later, cleanup...
      
      
        //server.close();
        //client.destroy();


      })();
    
    });
}