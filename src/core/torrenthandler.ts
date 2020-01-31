const WebTorrent = require('webtorrent-hybrid');
import * as videoplayer from '../desktop/videoplayer'
import * as tui from '../desktop/tui'

require('events').EventEmitter.defaultMaxListeners = 0;

var streamPort: number;

export var downloadInfo = "";
var currentTorrent : any;

var client = new WebTorrent();
var interval : any;

export function start(magnetURI: string) {

    // remove last torrent
    if (currentTorrent != undefined) {
      console.log("Removing previous torrent: " + currentTorrent.name);
      client.remove(currentTorrent, function(err: string){
        if (err) 
          console.log("Error removing torrent: " + err);
        else 
          console.log("Removing torrent successful");
      });
    }

    // and add the new one
    client.add(magnetURI, function (torrent: any) {
      
      currentTorrent = torrent;
      
      // create HTTP server for this torrent
      var server = torrent.createServer();

      const getPort = require('get-port'); // random available port

      (async () => {
        streamPort = await getPort();
        console.log("Starting http media server on port " + streamPort);
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

        clearInterval(interval);
        interval = setInterval(function () {

          var ETA : string = (torrent.timeRemaining/60000).toFixed(2) + " minutes";
          if (torrent.timeRemaining < 60000) {
            ETA = Math.floor(torrent.timeRemaining/1000) + " seconds"
          }

          downloadInfo = "Name: " + torrent.name 
          + "\nProgress: " + (torrent.progress * 100).toFixed(1) + "%" 
          + "\nDownload Speed: " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s "
          + "\nTorrent peer(s): " + torrent.numPeers
          + "\nETA: " + ETA;

          videoplayer.setTitle(torrent.name);
          tui.setTorrentInfo(downloadInfo);
      
        }, 200); // every 200 ms
      
        torrent.on("done", function () {
            
          downloadInfo = torrent.name + " (Download complete)";
          
          tui.setTorrentInfo(downloadInfo);
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