import * as blessed from 'blessed'
 
// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});
 
//screen.title = 'my window title';

var videoSource = blessed.form({
    width: '100%',
    height: '10%',
    label: 'Video Source',
    border: {
        type: 'line'
    },
    autoPadding: true
});

var roomInfo = blessed.box({
    top: '10%',
    width: '40%',
    height: '10%',
    label: 'Invite Link',
    content: 'not_set',
    border: {
        type: 'line'
    },
    autoPadding: true
});

var peersInfo = blessed.list({
    top: '20%',
    width: '40%',
    height: '40%',
    label: 'Peers',
    border: {
        type: 'line'
    },
    autoPadding: true
});

var torrentInfo = blessed.box({
    left: '0%',
    top: '60%',
    width: '40%',
    height: '40%',
    label: 'Torrent Info',
    border: {
        type: 'line'
    },
    autoPadding: true
});

 
// Create a box perfectly centered horizontally and vertically.
var debug = blessed.list({
  left: '40%',
  top: '10%',
  width: '60%',
  height: '90%',
  label: 'Debug Info',
  border: {
    type: 'line'
  },
  scrollable: true,
  autoPadding: true
});
 
// Append our box to the screen.
screen.append(videoSource);
screen.append(roomInfo);
screen.append(peersInfo);
screen.append(torrentInfo);
screen.append(debug);

 
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});
 
// Focus our element.
debug.focus();
 
// Render the screen.
console.clear();
screen.render();

export function addDebugInfo(info: string) {
    debug.pushLine(info);
    screen.render();
}

export function setTorrentInfo(info: string) {
    torrentInfo.content = info;
    screen.render();
}

export function setRoomLink(link: string) {
    roomInfo.content = " " + link;
    screen.render();
}

export function addNewPeer(peer: string) {
    peersInfo.pushLine(peer);
    screen.render();
}

export function setVideoSource(source: string) {
    videoSource.content = " " + source;
    screen.render();
}