console.log("Starting syncwatch");
const WebTorrent = require('webtorrent-hybrid');

var client = new WebTorrent()

var magnetURI = 'magnet:?xt=...'

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

  // later, cleanup...
  //server.close()
  //client.destroy()
});

