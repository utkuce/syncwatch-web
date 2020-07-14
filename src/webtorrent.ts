import { sendVideoSource } from './sync'
import { updateTorrentElement } from './interface'

var WebTorrent = require('webtorrent');
var client = new WebTorrent();


export function seed(file: File) {

    clearTorrents(); // One torrent at a time for simplicity

    updateTorrentElement("Preparing to upload... (" + file.name + ")");

    client.seed(file, function (torrent: any) {

        torrentVerbose(torrent);

        console.log('Client is seeding ' + torrent.magnetURI);
        updateTorrentElement("Seeding: " + torrent.name);
            
        sendVideoSource(torrent.magnetURI);

        var uploadClear: any;
        torrent.on('upload', function () {

            if (uploadClear)
                clearTimeout(uploadClear);

            updateTorrentElement(
                "Seeding: " + torrent.name
                + " - " + torrent.numPeers + " peer(s)"
                + " - " + (torrent.uploadSpeed / Math.pow(10,6)).toFixed(2)  
                + " mb/s <i class='fas fa-long-arrow-alt-up'></i>"
            );

            // after 1 second of last upload event clear upload speed and numPeers
            // unless another upload event occurs before
            uploadClear = setTimeout(function(){ 
                updateTorrentElement("Seeding: " + torrent.name); 
            }, 1000);
        });
    });
}

var videoExtensions = require("video-extensions");
export function handleTorrent(magnetURI: string) {

    console.log("Running torrent handler");

    clearTorrents();

    client.add(magnetURI, function(torrent: any) {

        console.log("Added torrent:", torrent.name);
        torrentVerbose(torrent);

        // Render the first file with a video extension found
        torrent.files.forEach((file: any) => {
            var ext = file.name.substr(file.name.lastIndexOf('.') + 1);
            if (videoExtensions.includes(ext)){
                file.renderTo("video");
                return;
            }
        });
  
        var downloadInfo: string;
        torrent.on("download", function() {
  
            var ETA : string = (torrent.timeRemaining/60000).toFixed(2) + " minutes left";
            if (torrent.timeRemaining < 60000) {
                ETA = Math.floor(torrent.timeRemaining/1000) + " seconds left"
            }
  
            downloadInfo = torrent.name 
                + " - " + (torrent.progress * 100).toFixed(1) + "%" 
                + " - " + torrent.numPeers + " peer(s)"
                + " - " + (torrent.downloadSpeed / Math.pow(10,6)).toFixed(2)  
                + " mb/s <i class='fas fa-long-arrow-alt-down'></i>"
                + " - " + ETA;
  
            updateTorrentElement(downloadInfo);
        });
  
        torrent.on("done", function () {
            downloadInfo = torrent.name + " (Download complete)";
            console.log(downloadInfo);
            updateTorrentElement(downloadInfo);
        });
  
        torrent.on('error', function (err: any) {
            console.log(err);
            alert(err);
        });
        
    });
  }

function clearTorrents() {

    updateTorrentElement("");

    client.torrents.forEach(function(torrentId: any) {
    client.remove(torrentId, function (err: Error) {
        if (err) console.log(err);
        console.log("Removed torrent:" + torrentId.name);
      });
    });
}

function torrentVerbose(torrent: any) {

    torrent.on('noPeers', function (announceType: any) {
        console.log("No peers, announce type:" + announceType);
    });

    torrent.on('warning', function (err: Error) {
        console.log("Torrent warning: " + err);
    });

    torrent.on('error', function (err: Error) {
        console.log("Torrent error: " + err);
    });
    
    torrent.on('wire', function (_wire: any, addr: any) {
        console.log('connected to peer with address ' + addr)
    });
}