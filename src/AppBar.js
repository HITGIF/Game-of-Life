import React from 'react';
import clsx from 'clsx';
import { loadCSS } from 'fg-loadcss';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import {PanTool, PlayArrow, Menu, Edit} from '@material-ui/icons';
import Pause from '@material-ui/icons/Pause';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Fab from "@material-ui/core/Fab";
import Icon from '@material-ui/core/Icon';
import {red} from "@material-ui/core/colors";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  button: {
    backgroundColor: red,
  },
  runBtn: {
    width: 150,
    margin: theme.spacing(2),
  },
  extendedIcon: {
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
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export default function PersistentDrawerLeft (props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [mode, setMode] = React.useState('pan');

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleRun = () => {
    props.setRunning(!running);
    setRunning(!running);
  };

  const handleMode = (event, newMode) => {
    props.setMode(newMode);
    setMode(newMode);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    loadCSS(
      'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
      document.querySelector('#font-awesome-css'),
    );
  }, []);


  function getRunFAB () {
    if (!running)
      return (
        <Fab variant="extended"
             color="primary"
             aria-label="add"
             className={classes.runBtn}
             onClick={handleRun}
        >
          <PlayArrow className={classes.extendedIcon}/>
        </Fab>
      );
    else return (
      <Fab variant="extended"
           color="secondary"
           aria-label="add"
           className={classes.runBtn}
           onClick={handleRun}
      >
        <Pause className={classes.extendedIcon}/>
      </Fab>
    )
  }

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        className={clsx(classes.menuButton, open && classes.hide)}
      >
        <Menu/>
      </IconButton>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
          </IconButton>
        </div>
        <div className={classes.drawerContainer}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleMode}
            aria-label="text alignment"
          >
            <ToggleButton value="0" aria-label="pan">
              <PanTool/>
            </ToggleButton>
            <ToggleButton value="1" aria-label="draw">
              <Edit/>
            </ToggleButton>
            <ToggleButton value="2" aria-label="erase">
              <Icon className="fa fa-eraser"/>
            </ToggleButton>
          </ToggleButtonGroup>
          {getRunFAB()}
        </div>
      </Drawer>
    </div>
  );
}
