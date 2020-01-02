const WebTorrent = require('webtorrent-hybrid');
var client = new WebTorrent();

import * as videoplayer from './videoplayer'

var streamPort;
exports.port = streamPort;

var downloadInfo = "";
export function getDownloadInfo() {
  return downloadInfo;
}

export function start(magnetURI: string) {

    client.add(magnetURI, function (torrent: any) {
      // create HTTP server for this torrent
      var server = torrent.createServer();

      const getPort = require('get-port'); // random available port

      (async () => {
        streamPort = await getPort();
        console.log("Starting server on port " + streamPort);
        server.listen(streamPort); // start the server listening to a port


        var interval = setInterval(function () {
          //console.clear();

          var ETA : string = (torrent.timeRemaining/60000).toFixed(2) + " minutes";
          if (torrent.timeRemaining < 60000) {
            ETA = Math.floor(torrent.timeRemaining/1000) + " seconds"
          }

          downloadInfo = torrent.name + " (Downloading: " + (torrent.progress * 100).toFixed(1) + "%" 
          + " - " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  + " mb/s "
          + " from " + torrent.numPeers + " peer(s)"
          + " ETA: " + ETA + " )";

          //ideoPlayer.oscMessage(downloadInfo);

          //console.log(downloadInfo);
          videoplayer.setTitle(downloadInfo);
      
        }, 200);
      
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
      
        videoplayer.start("http://localhost:" + streamPort + "/0"); // TODO: fix video file index
         
        // later, cleanup...
      
      
        //server.close();
        //client.destroy();


      })();
    
    });
}