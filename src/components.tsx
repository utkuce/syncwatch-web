import { Text, View, Button, useEventHandler, LineEdit, ProgressBar } from "@nodegui/react-nodegui";
import { QPushButtonSignals, QLineEdit } from "@nodegui/nodegui";
import React from "react";

import * as videoplayer from "./core/videoplayer";

export function URLInput() {

  const btnHandler = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => { 
        if (urlbox.current != null && urlbox.current.text() != "") {
          videoplayer.start(urlbox.current.text()!);
        }
      } 
    },
    []
  );

  var urlbox = React.createRef<QLineEdit>()
  return (
    <View style={containerStyle}>

      <LineEdit 
        style={textBoxStyle}
        ref={urlbox}
        placeholderText="Enter a magnet link or url">
      </LineEdit>

      <Button 
        style={btnStyle} 
        on={btnHandler} 
        text={`Stream`}>
      </Button>

    </View>
  );
}

const containerStyle = `
  margin-horizontal: 10px;
  justify-content: 'space-around';
`;

const textStyle = `
  margin-horizontal: 10px;
`;

const btnStyle = `
  height: 25px;
  width: 100px;
`;

const textBoxStyle = `
  height: 25px;
  width: 300px;
`;