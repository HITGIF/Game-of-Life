import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import '../GameOfLife.css'

const useStyles = makeStyles(theme => ({
  title: {
    margin: theme.spacing(2),
    width: 150,
    fontSize: 35,
    fontFamily: 'Fipps',
    textAlign: 'center',
  },
}));

export default function GameTitle() {
  const classes = useStyles();
  return (
    <Typography className={classes.title}>
      Game of Life
    </Typography>
  )
}
