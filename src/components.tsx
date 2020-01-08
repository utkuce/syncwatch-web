import { Text, View, Button, useEventHandler, LineEdit, ProgressBar } from "@nodegui/react-nodegui";
import { QLineEdit, QPushButton } from "@nodegui/nodegui";
import React from "react";

import * as videoplayer from "./core/videoplayer";
import * as torrenthandler from "./core/torrenthandler";
import * as peers from "./core/peers"

const peersList : string = "None";
const titleStyle = "font-size: 16px; padding-top: 10px;"

const urlbox = React.createRef<QLineEdit>();
const copyButton = React.createRef<QPushButton>();
const streamButton = React.createRef<QPushButton>();

export class Components extends React.Component<{}, { downloadInfo: string, peersInfo: string }>{

  
  constructor(props: any) {
    super(props);
    this.state = { 
      downloadInfo: torrenthandler.downloadInfo,
      peersInfo : peers.connectedDisplay
    }
  }

  setDownloadState() {
    this.setState({downloadInfo: torrenthandler.downloadInfo});
  }

  setPeersSTate() {
    this.setState({peersInfo: peers.connectedDisplay})
  }

  componentDidMount() {

    if (copyButton.current != null) {
      copyButton.current.addEventListener("clicked", () => {
        console.log("copy button clicked");
        require("child_process").spawn("clip").stdin.end(peers.roomLink)
      });
    }

    if (streamButton.current != null) {
      streamButton.current.addEventListener("clicked", () => {
        console.log("stream button clicked");
        if (urlbox.current != null && urlbox.current.text() != "")
          videoplayer.setSource(urlbox.current.text()!);
      });
    }
  }

  render() {

    return (

      <View>

        <Text style={titleStyle}>Video Source</Text>
        <Text  wordWrap={true}>
          {`Enter a magnet link or a video url. A complete list of available video sources can be found at <br>https://ytdl-org.github.io/youtube-dl/supportedsites.html`}
        </Text>
        <View style="display: flex; flex-direction: row;">
          <LineEdit 
            style="height: 25px; flex: 1; padding-left: 10px"
            ref={urlbox}
            placeholderText="Enter a magnet link or url">
          </LineEdit>
          <Button 
            style="height: 25px; width: 75px; margin-left: 5px;"
            ref={streamButton}
            text="Stream">
          </Button>
        </View>
        <Text style="padding-vertical: 5px;" wordWrap={true}>{torrenthandler.downloadInfo}</Text>

        <Text style={titleStyle}>Room Link</Text>
        <View style="display: flex; flex-direction: row;">
          <Text>{peers.roomLink}</Text>
          <Button 
            style="height: 25px; width: 125px; margin-left: 5px;"
            ref={copyButton}
            text="Copy to clipboard">
          </Button>
        </View>

        <Text style={titleStyle}>Connected Peers</Text>
        <Text>{peers.connectedDisplay}</Text>

      </View>
    );
  }
}

