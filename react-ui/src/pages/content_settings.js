import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import ErrorIcon from '@material-ui/icons/Error';
import DoneIcon from '@material-ui/icons/Done';
import green from '@material-ui/core/colors/green';
import { Paper } from '@material-ui/core';

import Config from './config';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing.unit,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
  appBarSpacer: theme.mixins.toolbar,
  demo: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
  },
  footer: {
    padding: "5px 10px"
  },
  icon: {
      position: "relative",
      top: theme.spacing.unit,
      width: theme.typography.display1.fontSize,
      height: theme.typography.display1.fontSize
  },
  success: {
    color: green[600],
  },
  error: {
    color: theme.palette.error.dark,
  }
});

class SettingsConfig extends React.Component {
  state = {
    dense: false,
    dialogOpen: false,
    settings: {}
  };

  save = (evt) => {
    const { classes } = this.props;

    fetch(Config.API_SERVER_URL + "/settings", {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settings: this.state.settings
      })
    })
    .then(res => res.json())
    .then(
      (result) => {
        if (result.status === "OK"){
          this.setState({
            dialogOpen: true,
            dialogContent:
              <DialogContent>
                  <DialogContentText id="alert-dialog-description" className={classes.success}>
                    <DoneIcon className={classes.icon}/> Saved settings.
                  </DialogContentText>
              </DialogContent>
          });
        } else {
          this.setState({
            dialogOpen: true,
            dialogContent:
              <DialogContent>
                  <DialogContentText id="alert-dialog-description" className={classes.error}>
                    <ErrorIcon className={classes.icon}/> Error while saving settings.
                  </DialogContentText>
              </DialogContent>
          });
        }
      },
      (error) => {
        this.setState({
          dialogOpen: true,
          dialogContent:
            <DialogContent>
              <DialogContentText id="alert-dialog-description" className={classes.error}>
                <ErrorIcon className={classes.icon}/> Error while saving settings.
              </DialogContentText>
            </DialogContent>
        });
      }
    );
  };

  load() {
    fetch(Config.API_SERVER_URL + "/settings", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          settings: result.settings
        });
      },
      (error) => {
        this.setState({
          settings: {}
        });
      }
    );
  };

  componentDidMount() {
    this.load();
  };

  componentWillUnmount() {
  };

  formatLabel(_label) {
    let label = _label.replace(/[_]/g, " ").replace(/[.]/g, " - ");

    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let settings = this.state.settings
    settings[name] = value

    this.setState({
      settings: settings
    });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    const { classes } = this.props;
    const { settings, dense } = this.state;

    let fields = Object.keys(settings).map((key, i) => {
      let value = settings[key];
      let label = this.formatLabel(key);

      return (
        <ListItem key={i}>
          <TextField
              name={key}
              variant="outlined"
              label={label}
              style={{ margin: 8 }}
              fullWidth
              margin="normal"
              InputLabelProps={{
                  shrink: true,
              }}
              value={value}
              onChange={this.handleInputChange}
              />
        </ListItem>
      )
    });

    return (
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Typography variant="h4" gutterBottom component="h2">
            Cofiguration
            </Typography>
            <Typography component="div" className={classes.mainContainer}>
                <Paper>
                    <Grid container spacing={24}>
                        <Grid item xs={12}>
                          <List dense={dense}>
                              <ListItem>
                                  <ListItemText>
                                  Modify the configration of Spotify Downloader.
                                  </ListItemText>
                              </ListItem>
                              {fields}
                              <ListItem>
                                <Button variant="contained" color="primary" className={classes.button} onClick={this.save}>
                                    Save
                                </Button>
                              </ListItem>
                          </List>
                        </Grid>
                    </Grid>
                </Paper>
            </Typography>
            <Dialog
                open={this.state.dialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                {this.state.dialogContent}
                <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary">
                    Close
                    </Button>
                </DialogActions>
            </Dialog>
        </main>
    );
  }
}

SettingsConfig.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SettingsConfig);