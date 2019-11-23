import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import PrimaryAppBar from "./AppBar";
import Button from "@material-ui/core/Button";
import GameBoard from "./GameBoard";
import {Modes} from "./js2plot";

class App extends Component {

  constructor (props) {
    super(props);
    this.state = {
      running: false,
      mode: Modes.PAN,
    };
  }

  render () {
    return (
      <div className="App">
        <PrimaryAppBar
          setRunning={(running) => {this.setState({running: running})}}
          setMode={(mode) => {this.setState({mode: mode})}}
        />
        <GameBoard running={this.state.running} mode={this.state.mode}/>
      </div>
    );
  }
}

export default App;
