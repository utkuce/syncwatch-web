
import * as room from "../core/room"
import * as videoplayer from "./videoplayer"

// if started with a join link join a room
if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch://")) {
    
    var roomId: string = process.argv[2].substring("syncwatch://".length);
    room.join(roomId);

  } else {
    room.create();
    videoplayer.setSource(process.argv[2]);
  }

} else { // else create your own room

  room.create();
}