import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import PrimaryAppBar from "./AppBar";
import Button from "@material-ui/core/Button";
import GameBoard from "./GameBoard";
import {Modes} from "./js2plot";
import {Patterns} from "./patterns";

class App extends Component {

  constructor (props) {
    super(props);
    this.state = {
      running: false,
      mode: Modes.PAN,
      algo_runtime: 0,
      render_runtime: 0,
      pattern: Patterns.pentadecathlon,
    };
  }

  render () {
    return (
      <div className="App">
        <PrimaryAppBar
          setRunning={(running) => {this.setState({running: running})}}
          setMode={(mode) => {this.setState({mode: mode})}}
          setPattern={(pattern) => {this.setState({pattern: pattern})}}
          render_runtime={this.state.render_runtime}
          algo_runtime={this.state.algo_runtime}
        />
        <GameBoard
          running={this.state.running}
          mode={this.state.mode}
          pattern={this.state.pattern}
          setRenderRuntime={(render_runtime) => {this.setState({render_runtime: render_runtime})}}
          setAlgoRuntime={(algo_runtime) => {this.setState({algo_runtime: algo_runtime})}}
        />
      </div>
    );
  }
}

export default App;
