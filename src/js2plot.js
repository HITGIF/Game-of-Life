export const Modes = {
  PAN: 0,
  DRAW: 1,
  ERASE: 2,
};

export default function js2plot (canvas, options) {

  // Settings
  if (options === undefined)
    options = {};
  let mode = Modes.PAN;
  let MAX_SCALE = 5;
  let MIN_SCALE = 0.02;
  let SCROLL_SENSITIVITY = 0.9;
  let base_size_ws = (options.base_size_ws !== undefined) ? options.base_size_ws : 1;
  let grid_line_spacing_ws = (options.grid_line_spacing_ws !== undefined) ? options.grid_line_spacing_ws : 1 / 50;

  // States
  let view_scale = (options.view_scale !== undefined) ? options.view_scale : 1.0;
  let view_center_ws = (options.view_center_ws !== undefined) ? options.view_center_ws :
    {x: 0.03, y: -0.01};

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

  //
  // Drawing code
  //

  /**
   * This function is the central piece of code that is called whenever something changed.
   * It resize the canvas so we have one canvas pixel for one CSS pixel and then redraws
   * the entire canvas.
   *
   * It returns `null` if everything went fine (no error). If the user code caused an exception
   * the Error object of it is returned.
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
          // ctx.putImageData(imgData, 10, 10);
          // ctx.putImageData(imgData, Math.floor(x_base), Math.floor(y_base));
          // let r = Math.floor(_sq(Math.cos(Math.atan2(n * 100, m * 100) / 2)) * 255);
          // let g = Math.floor(_sq(Math.cos(Math.atan2(n * 100, m * 100) / 2 - 2 * Math.acos(-1) / 3)) * 255);
          // let b = Math.floor(_sq(Math.cos(Math.atan2(n * 100, m * 100) / 2 + 2 * Math.acos(-1) / 3)) * 255);
          // ctx.fillStyle = fullColorHex(r, g, b);
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
    ctx.fillRect(Math.floor(x_ws_base + (m-xi) * factor),
      Math.floor(y_ws_base - (n-yi) * factor), width, width);
  }

  function eraseAt (x, y) {
    let m = Math.floor((x - x_ws_base) / factor) + xi;
    let n = Math.floor((y_ws_base - y) / factor) + yi +1;
    if (!last_board[m]) {
      last_board[m] = {};
      last_board[m][n] = 0;
    } else last_board[m][n] = 0;
    ctx.clearRect(Math.floor(x_ws_base + (m-xi) * factor),
      Math.floor(y_ws_base - (n-yi) * factor), width, width);
  }

  // Color Pattern
  var rgbToHex = function (rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return hex;
  };

  var fullColorHex = function (r, g, b) {
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return "#" + red + green + blue;
  };

  function _sq (x) {
    return x * x;
  }


  //
  // Event handling
  //

  // When the mouse button is down this letiable contains the last mouse position (as an
  // { x: ..., y: ... } object). Otherwise it is set to `null`.
  let last_mouse_pos = null;

  // Pan the view with mouse drag
  ctx.canvas.addEventListener("mousedown", function (event) {
    if (event.target === ctx.canvas) {
      last_mouse_pos = {x: event.pageX, y: event.pageY};
      switch (mode) {
        case Modes.PAN:
          break;
        case Modes.DRAW:
          drawAt(event.pageX, event.pageY);
          break;
        case Modes.ERASE:
          eraseAt(event.pageX, event.pageY);
          break;
      }
      event.stopPropagation();
      event.preventDefault();
    }
  });
  document.addEventListener("mousemove", function (event) {
    if (last_mouse_pos) {
      switch (mode) {
        case Modes.PAN:
          let dx_vs = event.pageX - last_mouse_pos.x;
          let dy_vs = event.pageY - last_mouse_pos.y;
          last_mouse_pos.x = event.pageX;
          last_mouse_pos.y = event.pageY;
          view_center_ws.x -= dx_vs / ws_to_vs_scale;
          view_center_ws.y -= dy_vs / ws_to_vs_scale * -1;
          updateCanvasSizeAndRedraw(last_board);
          ctx.canvas.dispatchEvent(new Event("plotchange"));
          break;
        case Modes.DRAW:
          drawAt(event.pageX, event.pageY);
          break;
        case Modes.ERASE:
          eraseAt(event.pageX, event.pageY);
          break;
      }
      event.stopPropagation();
      event.preventDefault();
    }
  });
  document.addEventListener("mouseup", function (event) {
    if (last_mouse_pos) {
      // switch (mode) {
      //   case Modes.PAN:
      last_mouse_pos = null;
      ctx.canvas.dispatchEvent(new Event("plotchangeend"));
      //     break;
      // }
      event.stopPropagation();
      event.preventDefault();
    }
  });

  // Zoom in or out with the mouse wheel
  ctx.canvas.addEventListener("wheel", function (event) {
    // Calculate cross-browser offsetX and offsetY. Older Firefox versions don't support them
    // as properties of the event object.
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
    ctx.canvas.dispatchEvent(new Event("plotchange"));
    ctx.canvas.dispatchEvent(new Event("plotchangeend"));
    event.stopPropagation();
    event.preventDefault();
  });


  //
  // Public interface
  //
  return {
    /**
     * Redraw the canvas, optionally with new JavaScript code from the user. When called without
     * an argument it just redraws the canvas. When called with one string argument the string is
     * used as JavaScript code and the canvas is redrawn with that code.
     *
     * If everything went fine `null` is returned (no error). If the code contained errors the Error
     * object of the exception is returned (e.g. a TypeError for an unknown function name).
     */
    update: function (board) {
      // updateScale()
      drawGrid(board);
      last_board = board;
      // ctx.canvas.dispatchEvent(new Event("plotchangeend"));
    },

    updateAndRedraw: function (board) {
      updateCanvasSizeAndRedraw(board);
      last_board = board;
      // ctx.canvas.dispatchEvent(new Event("plotchangeend"));
    },

    /**
     * Returns or sets the current scale representing the users zoom. It's larger than 1 when
     * the user zoomed in and smaller than 1 (but never 0) when the user zoomed out.
     *
     * When the function is called without an argument the current scale is returned. When it
     * is called with one number argument the current scale is set to this value but the canvas is
     * not redrawn. You have to call update() for that.
     *
     * For example a scale of 2.0 shows the canvas twice as large as 1.0 (zoomed in).
     * A scale of 0.5 shows the canvas twice as small as 1.0 (zoomed out).
     */
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

    /**
     * Returns or sets the current center of the view (expressed in world space coordinates).
     *
     * When the function is called without arguments it returns the current center as an
     * `{ x: ..., y: ... }` object. When it's called with two number arguments the current center
     * is set to these coordinates (x and y) but the canvas is not redawn (call update() for that).
     *
     * For example when the center is {x: 0, y: 0} the origin of the canvas is shown at the center
     * of the canvas. If it's {x: 3.141, y: 0} this world space position is shown at the center of
     * the canvas.
     */
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
      console.log(mode)
      // updateCanvasSizeAndRedraw(last_board);
    }
  };
}
