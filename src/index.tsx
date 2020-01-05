import { Renderer } from "@nodegui/react-nodegui";
import React from "react";
import App from "./app";

import * as peers from "./core/peers"
import * as videoplayer from "./core/videoplayer"

// if started with a join link join a room
if (process.argv[2]) {

  if (process.argv[2].startsWith("syncwatch://")) {
    
    var roomId: string = process.argv[2].substring("syncwatch://".length);
    peers.join(roomId);

  }

  if (process.argv[2].startsWith("magnet:")) {
    videoplayer.setSource(process.argv[2]);
    peers.createRoom();
  }

} else { // else create your own room

  peers.createRoom();

  //process.exit();
}

process.title = "Syncwatch";
Renderer.render(<App />);
// This is for hot reloading (this will be stripped off in production by webpack)
if (module.hot) {
  module.hot.accept(["./app"], function() {
    Renderer.forceUpdate();
  });
}