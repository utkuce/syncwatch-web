const WebTorrent = require('webtorrent-hybrid');
var client = new WebTorrent();
import * as videoplayer from './videoplayer'

var streamPort: number;

export var downloadInfo = "";

export function start(magnetURI: string) {

    client.add(magnetURI, function (torrent: any) {
      // create HTTP server for this torrent
      var server = torrent.createServer();

      const getPort = require('get-port'); // random available port

      (async () => {
        streamPort = await getPort();
        console.log("Starting htpp server on port " + streamPort);
        server.listen(streamPort); // start the server listening to a port

        console.log("Searching torrent contents");
        torrent.files.forEach(function (file: any, index: number) {
          //console.log(file.name);
          var ext = file.name.substr(file.name.lastIndexOf('.') + 1);
          var videoExtensions = require('video-extensions');
          if (videoExtensions.includes(ext)) {
            console.log("Found video file at index " + index);
            videoplayer.start("http://localhost:" + streamPort + "/" + index);
          }
        });

        var interval = setInterval(function () {

          var ETA : string = (torrent.timeRemaining/60000).toFixed(2) + " minutes";
          if (torrent.timeRemaining < 60000) {
            ETA = Math.floor(torrent.timeRemaining/1000) + " seconds"
          }

          downloadInfo = torrent.name + "(" + (torrent.progress * 100).toFixed(1) + "%" 
          + " - " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s "
          + " - " + torrent.numPeers + " peer(s)"
          + " - ETA: " + ETA + " )";

          //console.log(downloadInfo);
          videoplayer.setTitle(downloadInfo);
      
        }, 200); // every 200 ms
      
        torrent.on("done", function () {
            
          downloadInfo = torrent.name + " (Download complete)";

          console.log(downloadInfo);
          videoplayer.setTitle(downloadInfo);

          clearInterval(interval);
        });
      
        torrent.on('error', function (err: any) {
            console.log(err);
        });
      
        // visit http://localhost:<port>/ to see a list of files
      
        // access individual files at http://localhost:<port>/<index> where index is the index
        // in the torrent.files array
      
         
        // later, cleanup...
      
      
        //server.close();
        //client.destroy();


      })();
    
    });
}