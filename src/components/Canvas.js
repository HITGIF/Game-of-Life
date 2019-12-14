/*
  Modified based on [js2plot](https://github.com/arkanis/js2plot)
 */

export const Modes = {
  PAN: 0,
  DRAW: 1,
  ERASE: 2,
};

export default function Canvas (canvas) {

  let mode = Modes.PAN;
  let MAX_SCALE = 5;
  let MIN_SCALE = 0.02;
  let SCROLL_SENSITIVITY = 0.9;
  let base_size_ws = 1;
  let grid_line_spacing_ws = 1 / 50;

  let view_scale = 1.0;
  let view_center_ws = {x: 0.007, y: -0.007};

  let ctx = canvas.getContext("2d");
  let last_board = null;
  let ws_to_vs_scale = 1.0;

  function x_ws_to_vs (x_ws) {
    return (ctx.canvas.width / 2) - view_center_ws.x * ws_to_vs_scale + x_ws * ws_to_vs_scale;
  }

  function y_ws_to_vs (y_ws) {
    return (ctx.canvas.height / 2) + view_center_ws.y * ws_to_vs_scale - y_ws * ws_to_vs_scale;
  }

  function x_vs_to_ws (x_vs) {
    return view_center_ws.x + (x_vs - ctx.canvas.width / 2) / ws_to_vs_scale;
  }

  function y_vs_to_ws (y_vs) {
    return view_center_ws.y + (y_vs - ctx.canvas.height / 2) / ws_to_vs_scale * -1;
  }

  /*
    Drawing
  */
  function updateCanvasSizeAndRedraw (board) {
    updateScale();
    drawGrid(board);
    return null;
  }

  let x_min_ws, x_max_ws, y_min_ws, y_max_ws, xm, ym, xi, yi, factor, x_ws_base, y_ws_base, width;

  function updateScale () {
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;
    let base_scale = Math.min(ctx.canvas.width, ctx.canvas.height) / base_size_ws;
    ws_to_vs_scale = base_scale * view_scale;
    x_min_ws = x_vs_to_ws(0);
    x_max_ws = x_vs_to_ws(ctx.canvas.width - 1);
    y_min_ws = y_vs_to_ws(ctx.canvas.height - 1);
    y_max_ws = y_vs_to_ws(0);
    width = Math.ceil(x_ws_to_vs(2 * grid_line_spacing_ws) -
      x_ws_to_vs(grid_line_spacing_ws));
    xm = x_max_ws / grid_line_spacing_ws + 1;
    ym = y_max_ws / grid_line_spacing_ws + 1;
    xi = Math.floor(x_min_ws / grid_line_spacing_ws) - 1;
    yi = Math.floor(y_min_ws / grid_line_spacing_ws);
    factor = ws_to_vs_scale * grid_line_spacing_ws;
    x_ws_base = Math.floor(x_ws_to_vs(xi * grid_line_spacing_ws));
    y_ws_base = Math.floor(y_ws_to_vs(yi * grid_line_spacing_ws));
  }

  function drawGrid (board) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let x_base = x_ws_base;
    for (let m = xi; m <= xm; m++, x_base += factor) {
      let y_base = y_ws_base;
      for (let n = yi; n <= ym; n++, y_base -= factor) {
        if (board[m] && board[m][n]) {
          ctx.fillRect(Math.floor(x_base), Math.floor(y_base), width, width);
        }
      }
    }
  }

  function drawAt (x, y) {
    let m = Math.floor((x - x_ws_base) / factor) + xi;
    let n = Math.floor((y_ws_base - y) / factor) + yi + 1;
    if (!last_board[m]) {
      last_board[m] = {};
      last_board[m][n] = 1;
    } else last_board[m][n] = 1;
    ctx.fillRect(Math.floor(x_ws_base + (m - xi) * factor),
      Math.floor(y_ws_base - (n - yi) * factor), width, width);
  }

  function eraseAt (x, y) {
    let m = Math.floor((x - x_ws_base) / factor) + xi;
    let n = Math.floor((y_ws_base - y) / factor) + yi + 1;
    if (!last_board[m]) {
      last_board[m] = {};
      last_board[m][n] = 0;
    } else last_board[m][n] = 0;
    ctx.clearRect(Math.floor(x_ws_base + (m - xi) * factor),
      Math.floor(y_ws_base - (n - yi) * factor), width, width);
  }

  /*
    Event Handling
   */
  let last_mouse_pos = null;

  function getXYFromEvent (event) {
    let x = 0, y = 0;
    if (event instanceof MouseEvent) {
      x = event.pageX;
      y = event.pageY;
    } else if (event instanceof TouchEvent) {
      x = event.changedTouches['0'].pageX;
      y = event.changedTouches['0'].pageY;
    }
    return {x, y}
  }

  let touchDown = function (event) {
    //TODO Pinch
    let {x, y} = getXYFromEvent(event);
    if (event.target === ctx.canvas) {
      last_mouse_pos = {x: x, y: y};
      switch (mode) {
        case Modes.PAN:
          break;
        case Modes.DRAW:
          drawAt(x, y);
          break;
        case Modes.ERASE:
          eraseAt(x, y);
          break;
        default:
          break;
      }
      event.stopPropagation();
      event.preventDefault();
    }
  };

  let touchMove = function (event) {
    let {x, y} = getXYFromEvent(event);
    if (last_mouse_pos) {
      switch (mode) {
        case Modes.PAN:
          let dx_vs = x - last_mouse_pos.x;
          let dy_vs = y - last_mouse_pos.y;
          last_mouse_pos.x = x;
          last_mouse_pos.y = y;
          view_center_ws.x -= dx_vs / ws_to_vs_scale;
          view_center_ws.y -= dy_vs / ws_to_vs_scale * -1;
          updateCanvasSizeAndRedraw(last_board);
          break;
        case Modes.DRAW:
          drawAt(x, y);
          break;
        case Modes.ERASE:
          eraseAt(x, y);
          break;
        default:
          break;
      }
      event.stopPropagation();
      event.preventDefault();
    }
  };

  let touchUp = function (event) {
    if (last_mouse_pos) {
      last_mouse_pos = null;
      event.stopPropagation();
      event.preventDefault();
    }
  };

  ctx.canvas.addEventListener("mousedown", touchDown);
  document.addEventListener("mousemove", touchMove);
  document.addEventListener("mouseup", touchUp);
  ctx.canvas.addEventListener("touchstart", touchDown);
  ctx.canvas.addEventListener("touchmove", touchMove);
  ctx.canvas.addEventListener("touchend", touchUp);

  ctx.canvas.addEventListener("wheel", function (event) {
    let bb = this.getBoundingClientRect();
    let offsetX = event.pageX - bb.left, offsetY = event.pageY - bb.top;
    let scale_multiplier = (event.deltaY > 0) ?
      SCROLL_SENSITIVITY /* zoom out */ :
      1 / SCROLL_SENSITIVITY /* zoom in */;
    if ((view_scale >= MAX_SCALE && scale_multiplier > 1) ||
      (view_scale <= MIN_SCALE && scale_multiplier < 1)) return;
    let scale_old = ws_to_vs_scale;
    let scale_new = ws_to_vs_scale * scale_multiplier;
    let point_x_ws = x_vs_to_ws(offsetX), point_y_ws = y_vs_to_ws(offsetY);
    let view_center_old = view_center_ws;
    view_center_ws = {
      x: point_x_ws + (view_center_old.x - point_x_ws) * (scale_old / scale_new),
      y: point_y_ws + (view_center_old.y - point_y_ws) * (scale_old / scale_new)
    };
    view_scale *= scale_multiplier;
    updateCanvasSizeAndRedraw(last_board);
    event.stopPropagation();
    event.preventDefault();
  });

  /*
    Public interface
  */
  return {
    update: function (board) {
      drawGrid(board);
      last_board = board;
    },
    updateAndRedraw: function (board) {
      updateCanvasSizeAndRedraw(board);
      last_board = board;
    },
    scale: function (new_scale) {
      if (typeof new_scale === "number") {
        if (new_scale > MAX_SCALE) new_scale = MAX_SCALE;
        if (new_scale < MIN_SCALE) new_scale = MIN_SCALE;
        view_scale = new_scale;
        return this;
      } else {
        return view_scale;
      }
    },
    center: function (new_view_center_x, new_view_center_y) {
      if (typeof new_view_center_x === "number" && typeof new_view_center_y === "number") {
        view_center_ws = {x: new_view_center_x, y: new_view_center_y};
        return this;
      } else {
        return {x: view_center_ws.x, y: view_center_ws.y};
      }
    },
    setMode: function (newMode) {
      mode = parseInt(newMode);
    }
  };
}
