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
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import {Patterns} from "./patterns";
import MenuItem from "@material-ui/core/MenuItem";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(2),
    width: 150,
  },
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
  const inputLabel = React.useRef(null);
  const [open, setOpen] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [mode, setMode] = React.useState('pan');
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
    props.setMode(newMode);
    setMode(newMode);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChange = name => event => {
    setPattern(event.target.value);
    props.setPattern(Patterns[event.target.value]);
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
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel ref={inputLabel} id="pattern-select-outlined-label">
              Pattern
            </InputLabel>
            <Select
              value={pattern}
              onChange={handleChange('pattern')}
              labelWidth={labelWidth}
              inputProps={{
                name: 'pattern',
                id: 'outlined-age-native-simple',
              }}
            >
              {Object.keys(Patterns).map((key) =>
                <MenuItem value={key}>{Patterns[key].name}</MenuItem>
              )}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleMode}
            aria-label="text alignment"
          >
            <ToggleButton value="0" aria-label="pan" selected={true}>
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
          <span>Algo: {props.algo_runtime} ms</span>
          <span>Render: {props.render_runtime} ms</span>
        </div>
      </Drawer>
    </div>
  );
}
