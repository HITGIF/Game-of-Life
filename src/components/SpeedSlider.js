import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const useStyles = makeStyles(theme => ({
  root: {
    width: 140,
    marginTop: theme.spacing(2),
  },
}));

export default function SpeedSlider(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(1);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    props.setSpeed(newValue);
  };

  return (
    <div className={classes.root}>
      <Typography id="discrete-slider" variant="overline" >
        Speed
      </Typography>
      <Slider
        value={value}
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        onChange={handleSliderChange}
        step={1}
        min={1}
        max={60}
      />
    </div>
  );
}
