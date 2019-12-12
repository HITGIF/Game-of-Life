import React, {Component} from 'react';
import PrimaryAppBar from "./components/AppBar";
import GameBoard from "./components/GameBoard";
import {Modes} from "./components/Canvas";
import {Patterns} from "./res/Patterns";
import './GameOfLife.css';

class GameOfLife extends Component {

  constructor (props) {
    super(props);
    this.state = {
      running: true,
      speed: 1,
      mode: Modes.PAN,
      pattern: Patterns.pentadecathlon,
    };
  }

  render () {
    return (
      <div className="root">
        <PrimaryAppBar
          setRunning={(running) => {
            this.setState({running: running})
          }}
          setMode={(mode) => {
            this.setState({mode: mode})
          }}
          setPattern={(pattern) => {
            this.setState({pattern: pattern})
          }}
          setSpeed={(speed) => {
            this.setState({speed: speed})
          }}
        />
        <GameBoard
          running={this.state.running}
          mode={this.state.mode}
          pattern={this.state.pattern}
          speed={this.state.speed}
        />
      </div>
    );
  }
}

export default GameOfLife;
