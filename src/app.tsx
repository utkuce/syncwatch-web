import { Text, Window, hot, View } from "@nodegui/react-nodegui";
import React from "react";
import { URLInput } from "./components";

const minSize = { width: 500, height: 520 };
class App extends React.Component {
  render() {
    return (
      <Window
        //windowIcon={winIcon}
        windowTitle="Syncwatch"
        minSize={minSize}
        styleSheet={styleSheet}
      >
        <View style={containerStyle}>
          <Text id="welcome-text">Welcome to Syncwatch 🖥️</Text>
          <URLInput />
        </View>
      </Window>
    );
  }
}

const containerStyle = `
  flex: 1; 
`;

const styleSheet = `
  #welcome-text {
    font-size: 24px;
    padding-top: 20px;
    qproperty-alignment: 'AlignHCenter';
    font-family: 'sans-serif';
  }

  #step-1, #step-2 {
    font-size: 18px;
    padding-top: 10px;
    padding-horizontal: 20px;
  }
`;

export default hot(App);
