import React, {Component} from "react";
import './App.css'
import './patterns'
import js2plot, {Modes} from "./js2plot";
import {gosper_glider_gun, pentadecathlon, zero_zero} from "./patterns";

export default class GameBoard extends Component {

  board = pentadecathlon;
  timer = null;

  constructor (props) {
    super(props);
    this.state = {
      interval: 100,
      mode: Modes.PAN
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.mode !== this.state.mode) {
      console.log(this.props.mode)
      this.setState({mode: this.props.mode});
      this.canvas.setMode(this.props.mode);
    }
    if (this.props.running && this.timer === null) this.trigger();
    else if (!this.props.running && this.timer !== null) this.stop();
  }

  componentDidMount () {
    this.canvas = js2plot(this.refs.canvas);
    this.canvas.update(this.board);
    window.addEventListener("resize", this.updateCanvas.bind(this));
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateCanvas.bind(this));
  }

  render () {
    return (
      <canvas ref="canvas" className='game_board'/>
    )
  }

  /*
  Interface
   */
  trigger () {
    if (this.timer != null) return;
    this.timer = setInterval(() => {
      this.update();
    }, this.state.interval);
  }

  stop () {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  updateCanvas() {
    if (this.canvas) this.canvas.update(this.board);
  }

  /*
  Game Logic
   */
  willLive (wasAlive, x, y) {
    let board = this.board;
    let count = 0;
    x = parseInt(x);
    y = parseInt(y);
    for (let i = x - 1; i <= x + 1; i++)
      for (let j = y - 1; j <= y + 1; j++)
        if ((i !== x || j !== y) && board[i] && board[i][j] > 0) count++;
    return count === 3 || (wasAlive && count === 2);
  }

  /*
  Runtime: O(n)
  Space: O(n)
  n = # of live cells
   */
  update () {

    // Add all neighbours of all live cells
    Object.keys(this.board).forEach(xi =>
      Object.keys(this.board[xi]).forEach(yi => {
          if (this.board[xi][yi]) {
            xi = parseInt(xi);
            yi = parseInt(yi);
            for (let x = xi - 1; x <= xi + 1; x++) {
              for (let y = yi - 1; y <= yi + 1; y++) {
                if (!this.board[x]) {
                  this.board[x] = {};
                  this.board[x][y] = 0;
                } else if (!this.board[x][y]) {
                  this.board[x][y] = 0;
                }
              }
            }
          }
        }
      )
    );

    // Update all live cells and their neighbours
    Object.keys(this.board).forEach(x =>
      Object.keys(this.board[x]).forEach(y => {
          if (this.willLive(this.board[x][y] === 1, x, y)) {
            if (this.board[x][y] > 0) this.board[x][y] = 1; // life -> life
            else this.board[x][y] = -1;                     // dead -> life
          } else {
            if (this.board[x][y] > 0) this.board[x][y] = 2; // life -> dead
            else this.board[x][y] = 0;                      // dead -> dead
          }
        }
      )
    );

    // Clean up
    Object.keys(this.board).forEach(x =>
      Object.keys(this.board[x]).forEach(y => {
          this.board[x][y] =
            (this.board[x][y] === 2) ? 0 :                // life -> dead
              (this.board[x][y] === -1) ? 1 :             // dead -> life
                this.board[x][y];
          if (!this.board[x][y])
            delete this.board[x][y];                      // delete dead cells
          if (Object.keys(this.board[x]).length === 0)
            delete this.board[x];                         // delete dead cols
        }
      )
    );

    // Update canvas
    this.canvas.update(this.board);
  }
}
