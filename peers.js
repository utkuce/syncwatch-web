var SimplePeer = require('simple-peer')
var wrtc = require('wrtc')

var peer1 = new SimplePeer({ initiator: true, wrtc: wrtc })
var peer2 = new SimplePeer({ wrtc: wrtc })
 
peer1.on('signal', data => {
  // when peer1 has signaling data, give it to peer2 somehow
  //peersRef.push({"data": data });
  
  peer2.signal(data)
  //console.log((JSON.stringify(data)));

 // var discordJoin = require('./discordjoin.js');
  //discordJoin.richPresence(joinSecret=JSON.stringify(data));
})
 
peer2.on('signal', data => {
  // when peer2 has signaling data, give it to peer1 somehow
  peer1.signal(data)
})
 
peer1.on('connect', () => {
  // wait for 'connect' event before using the data channel
  peer1.send('hey peer2, how is it going?')
})
 
peer2.on('data', data => {
  // got a data channel message
  console.log('got a message from peer1: ' + data)
})

function toBase64(string) {

    return Buffer.from(string).toString('base64');
}