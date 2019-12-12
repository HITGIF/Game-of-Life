import React, {Component} from "react";
import '../GameOfLife.css'
import '../res/Patterns'
import Canvas, {Modes} from "./Canvas";

export default class GameBoard extends Component {

  board = null;
  timer = null;

  constructor (props) {
    super(props);
    this.state = {
      speed: 1,
      mode: Modes.PAN,
    };
    this.board = JSON.parse(JSON.stringify(props.pattern.data));
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.mode !== this.state.mode) {
      this.setState({mode: this.props.mode});
      this.canvas.setMode(this.props.mode);
    }
    if (this.props.speed !== this.state.speed) {
      this.setState({speed: this.props.speed});
      if (this.timer !== null) {
        this.stop();
        this.trigger(this.getInterval(this.props.speed));
      }
    }
    if (this.props.running && this.timer === null)
      this.trigger(this.getInterval(this.props.speed));
    else if (!this.props.running && this.timer !== null) this.stop();
    if (this.props.pattern !== prevProps.pattern) {
      this.board = JSON.parse(JSON.stringify(this.props.pattern.data));
      this.updateCanvas();
    }
  }

  componentDidMount () {
    this.canvas = Canvas(this.refs.canvas);
    this.canvas.updateAndRedraw(this.board);
    if (this.props.running && this.timer === null)
      this.trigger(this.getInterval(this.props.speed));
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
  getInterval (speed) {
    return 1000 / speed;
  }

  trigger (interval) {
    if (this.timer !== null) return;
    this.timer = setInterval(() => {
      this.update();
    }, interval);
  }

  stop () {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  updateCanvas() {
    if (this.canvas) this.canvas.updateAndRedraw(this.board);
  }

  /*
    Game Logic
   */
  willLive (wasAlive, x, y) {
    let count = 0;
    for (let i = x - 1; i <= x + 1; i++)
      for (let j = y - 1; j <= y + 1; j++)
        if ((i !== x || j !== y) && this.board[i] && this.board[i][j] > 0)
          if (++count > 3) return false;
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
            xi = +xi;
            yi = +yi;
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
          if (this.willLive(this.board[x][y] === 1, +x, +y)) {
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
