
import * as peers from "../core/peers"
import * as videoplayer from "./videoplayer"

// if started with a join link join a room
if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch://")) {
    
    var roomId: string = process.argv[2].substring("syncwatch://".length);
    peers.join(roomId);

  } else {
    videoplayer.setSource(process.argv[2]);
    peers.createRoom();
  }

} else { // else create your own room

  peers.createRoom();
}