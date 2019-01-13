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
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
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

class ContentManualDownload extends React.Component {
  state = {
    dense: false,
    dialogOpen: false,
    dialogText: false,
  };

  validate() {
    if (!this.state.url || !/^https:\/\/open.spotify.com\/.+$/i.test(this.state.url)) {
      return 'Please enter a valid url'
    }

    return "";
  }

  submit = (evt) => {
    const { classes } = this.props;
    
    let validation_error = this.validate();
    if(validation_error !== ""){
      this.setState({
        dialogOpen: true,
        dialogText:  <Typography >
        <ErrorIcon/> "Validation error: {validation_error}
      </Typography>
      });

      return;
    }

    fetch(Config.API_SERVER_URL + "/download", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.state.url
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
                      <DoneIcon className={classes.icon}/> We have added successfully the URL to the download queue.
                    </DialogContentText>
                </DialogContent>
            });
          } else if (result.status === "ALREADY_ADDED"){
            this.setState({
              dialogOpen: true,
              dialogContent:
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" className={classes.error}>
                      <ErrorIcon className={classes.icon}/> The URL is already in the download queue.
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
                    <ErrorIcon className={classes.icon}/> Error while adding the URL to the download queue.
                  </DialogContentText>
              </DialogContent>
          });
        }
      )
  };

  getInfo = (evt) => {
    const { classes } = this.props;

    let validation_error = this.validate();
    if(validation_error !== ""){
      this.setState({
        dialogOpen: true,
        dialogText: "Validation error: " + validation_error
      });

      return;
    }

    fetch(Config.API_SERVER_URL + "/playlist_info", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.state.url
        })
      })
      .then(res => res.json())
      .then(
        (result) => {
          let tracks = result.tracks.map((element, i) => {
            return (
              <ListItem alignItems="flex-start">
                <IconButton aria-label="4 pending messages" className={classes.margin}>
                  <Badge badgeContent={i} color="primary">
                    <AudiotrackIcon />
                  </Badge>
                </IconButton>
                <ListItemText
                  primary={element.name}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" className={classes.inline} color="textPrimary">
                        {element.artists}
                      </Typography>
                      {element.album}
                    </React.Fragment>
                  }
                />
              </ListItem>
            )
          });

          this.setState({
            dialogOpen: true,
            dialogText:
              <div>
                <Typography variant="subtitle1">{result.name}</Typography>
                <br />
                <List component="nav" className={classes.root}>
                  {tracks}
                </List>
              </div>
          });
        },
        (error) => {
          this.setState({
            dialogOpen: true,
            dialogText: "Error while adding the URL to the download queue."
          });
        }
      )
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };


  render() {
    const { classes } = this.props;
    const { dense } = this.state;

    return (
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Typography variant="h4" gutterBottom component="h2">
            Manual Download
            </Typography>
            <Typography component="div" className={classes.mainContainer}>
                <Paper>
                    <Grid container spacing={24}>
                        <Grid item xs={12}>
                            <div className={classes.demo}>
                                <List dense={dense}>
                                    <ListItem>
                                        <ListItemText>
                                        Copy and paste a Spotify URL in the text field and click in "Donwload".
                                        </ListItemText>
                                    </ListItem>
                                    <ListItem>
                                      <TextField
                                          name="url"
                                          variant="outlined"
                                          label="Spotify URL"
                                          style={{ margin: 8 }}
                                          placeholder="https://open.spotify.com/..."
                                          fullWidth
                                          margin="normal"
                                          InputLabelProps={{
                                              shrink: true,
                                          }}
                                          onChange={this.handleInputChange}
                                          />
                                    </ListItem>
                                    <ListItem>
                                      <Button variant="contained" color="secondary" className={classes.button} onClick={this.getInfo}>
                                          Get Info
                                      </Button>
                                      <Button variant="contained" color="primary" className={classes.button} onClick={this.submit}>
                                          Download
                                      </Button>
                                    </ListItem>
                                </List>
                            </div>
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

ContentManualDownload.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContentManualDownload);