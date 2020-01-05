import { Text, Window, hot, View } from "@nodegui/react-nodegui";
import React from "react";
import { Components } from "./components";

export var componentsRef = React.createRef<Components>();
 

const minSize = { width: 0, height: 450 };
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
          <Components ref={componentsRef}/>
        </View>
      </Window>
    );
  }
}

const containerStyle = `
  flex: 1; 
  padding-horizontal: 20px;
  padding-bottom: 20px;
`;

const styleSheet = `
  #welcome-text {
    font-size: 24px;
    padding-top: 20px;
    qproperty-alignment: 'AlignHCenter';
    font-family: 'sans-serif';
    padding-horizontal: 10px;
  }

  #step-1, #step-2 {
    font-size: 18px;
    padding-top: 10px;
    padding-horizontal: 20px;
  }
`;

export default hot(App);
