const WebTorrent = require('webtorrent-hybrid');
var client = new WebTorrent();

var videoPlayer = require('./videoplayer.js');
var streamPort;
exports.port = streamPort;

exports.start = function(magnetURI) {

    client.add(magnetURI, function (torrent) {
      // create HTTP server for this torrent
      var server = torrent.createServer();

      const getPort = require('get-port'); // random available port

      (async () => {
        streamPort = await getPort();
        console.log("Starting server on port " + streamPort);
        server.listen(streamPort); // start the server listening to a port


        var interval = setInterval(function () {
          //console.clear();

          var downloadInfo = torrent.name + " (Downloading: " + (torrent.progress * 100).toFixed(1) + "%" 
          + " - " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s "
          + " from " + torrent.numPeers + " peer(s)"
          + " ETA: " + (torrent.timeRemaining/60000).toFixed(2) + " minutes)";

          videoPlayer.setTorrentInfo(
            torrent.name,
            torrent.progress,
            (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s ",
            (torrent.timeRemaining/60000).toFixed(2) + " minutes)",
            torrent.numPeers
          );

          //console.log(downloadInfo);
          //videoPlayer.setTitle(downloadInfo);
      
        }, 1000);
      
        torrent.on("done", function () {
            
          console.log(torrent.name + " (Download complete)");

          videoPlayer.setTorrentInfo(
            torrent.name,
            1.0,
            (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s ",
            (torrent.timeRemaining/60000).toFixed(2) + " minutes)",
            torrent.numPeers
          );

          //videoPlayer.setTitle(torrent.name + " (Download complete)");
          clearInterval(interval);
        });
      
        torrent.on('error', function (err) {
            console.log(err);
        });
      
        // visit http://localhost:<port>/ to see a list of files
      
        // access individual files at http://localhost:<port>/<index> where index is the index
        // in the torrent.files array
      
        videoPlayer.start("http://localhost:" + streamPort + "/0"); // TODO: fix video file index
         
        // later, cleanup...
      
      
        //server.close();
        //client.destroy();


      })();
    
    });
}