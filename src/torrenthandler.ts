const WebTorrent = require('webtorrent-hybrid');
var client = new WebTorrent();
import * as videoplayer from './videoplayer'
import * as tui from './tui'

require('events').EventEmitter.defaultMaxListeners = 0;

var streamPort: number;

export var downloadInfo = "";

export function start(magnetURI: string) {

    client.add(magnetURI, function (torrent: any) {
      // create HTTP server for this torrent
      var server = torrent.createServer();

      const getPort = require('get-port'); // random available port

      (async () => {
        streamPort = await getPort();
        tui.addDebugInfo("Starting htpp server on port " + streamPort);
        server.listen(streamPort); // start the server listening to a port

        tui.addDebugInfo("Searching torrent contents");
        torrent.files.forEach(function (file: any, index: number) {
          //tui.addDebugInfo(file.name);
          var ext = file.name.substr(file.name.lastIndexOf('.') + 1);
          var videoExtensions = require('video-extensions');
          if (videoExtensions.includes(ext)) {
            tui.addDebugInfo("Found video file at index " + index);
            videoplayer.start("http://localhost:" + streamPort + "/" + index);
          }
        });

        var interval = setInterval(function () {

          var ETA : string = (torrent.timeRemaining/60000).toFixed(2) + " minutes";
          if (torrent.timeRemaining < 60000) {
            ETA = Math.floor(torrent.timeRemaining/1000) + " seconds"
          }

          downloadInfo = "Name: " + torrent.name 
          + "\nProgress: " + (torrent.progress * 100).toFixed(1) + "%" 
          + "\nDownload Speed: " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s "
          + "\nTorrent peer(s): " + torrent.numPeers
          + "\nETA: " + ETA;

          //videoplayer.setTitle(downloadInfo);
          tui.setTorrentInfo(downloadInfo);
      
        }, 200); // every 200 ms
      
        torrent.on("done", function () {
            
          downloadInfo = torrent.name + " (Download complete)";

          tui.addDebugInfo(downloadInfo);
          videoplayer.setTitle(downloadInfo);

          clearInterval(interval);
        });
      
        torrent.on('error', function (err: any) {
            tui.addDebugInfo(err);
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