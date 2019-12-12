import React from 'react';
import clsx from 'clsx';
import {loadCSS} from 'fg-loadcss';

import {makeStyles, useTheme} from '@material-ui/core/styles';
import {
  Drawer,
  CssBaseline,
  IconButton,
  Icon,
  InputLabel,
  FormControl,
  Select,
  Typography,
  MenuItem
} from '@material-ui/core';
import {PanTool, Menu, Edit, ChevronLeft, ChevronRight} from '@material-ui/icons';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';

import SpeedSlider from "./SpeedSlider";
import GameTitle from "./GameTitle";
import {Patterns} from "../res/Patterns";
import {RunButton, StopButton} from "./RunStopButtons";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(3),
    width: 150,
  },
  root: {
    position: 'absolute',
    zIndex: 1,
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    margin: theme.spacing(1),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
}));

export default function PersistentDrawerLeft (props) {
  const classes = useStyles();
  const theme = useTheme();
  const inputLabel = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [running, setRunning] = React.useState(true);
  const [mode, setMode] = React.useState('0');
  const [pattern, setPattern] = React.useState('pentadecathlon');
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleRun = () => {
    props.setRunning(!running);
    setRunning(!running);
  };

  const handleMode = (event, newMode) => {
    if (newMode == null) return;
    props.setMode(newMode);
    setMode(newMode);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChange = _ => event => {
    setPattern(event.target.value);
    props.setPattern(Patterns[event.target.value]);
  };

  React.useEffect(() => {
    loadCSS(
      'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
      document.querySelector('#font-awesome-css'),
    );
  }, []);

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        className={clsx(classes.menuButton, open && classes.hide)}>
        <Menu/>
      </IconButton>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{paper: classes.drawerPaper}}>
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeft/> : <ChevronRight/>}
          </IconButton>
        </div>
        <div className={classes.drawerContainer}>
          <GameTitle/>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel ref={inputLabel} id="pattern-select-outlined-label">
              <Typography variant="button">Pattern</Typography>
            </InputLabel>
            <Select
              value={pattern}
              onChange={handleChange('pattern')}
              labelWidth={labelWidth}
              inputProps={{name: 'pattern', id: 'outlined-age-native-simple',}}>
              {Object.keys(Patterns).map((key) =>
                <MenuItem key={key} value={key}>{Patterns[key].name}</MenuItem>
              )}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleMode}
            defaultValue={"0"}
            aria-label="text alignment">
            <ToggleButton value="0" aria-label="pan"><PanTool/></ToggleButton>
            <ToggleButton value="1" aria-label="draw"><Edit/></ToggleButton>
            <ToggleButton value="2" aria-label="erase"><Icon className="fa fa-eraser"/></ToggleButton>
          </ToggleButtonGroup>
          <SpeedSlider setSpeed={(speed) => props.setSpeed(speed)}/>
          {running ? <StopButton handleRun={handleRun}/> : <RunButton handleRun={handleRun}/>}
        </div>
        <span>ooo</span>
      </Drawer>
    </div>
  );
}
