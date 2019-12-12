import {PlayArrow} from "@material-ui/icons";
import Fab from "@material-ui/core/Fab";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import Pause from "@material-ui/icons/Pause";

const useStyles = makeStyles(theme => ({
  runBtn: {
    width: 150,
    margin: theme.spacing(3),
  },
}));

export function RunButton (props) {
  return (
    <Fab variant="extended"
         color="primary"
         aria-label="run"
         className={useStyles().runBtn}
         onClick={props.handleRun}>
      <PlayArrow/>
    </Fab>
  )
}

export function StopButton (props) {
  return (
    <Fab variant="extended"
         color="secondary"
         aria-label="stop"
         className={useStyles().runBtn}
         onClick={props.handleRun}>
      <Pause/>
    </Fab>
  )
}
