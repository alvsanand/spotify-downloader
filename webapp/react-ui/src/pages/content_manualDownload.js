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

const styles = theme => ({
  root: {
    flexGrow: 1,
    maxWidth: "60%",
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
});

const URL = "http://127.0.0.1:5000"

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
    let validation_error = this.validate();
    if(validation_error !== ""){
      this.setState({
        dialogOpen: true,
        dialogText: "Validation error: " + validation_error
      });

      return;
    }

    fetch(URL + "/download", {
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
          this.setState({
            dialogOpen: true,
            dialogText: "We have added successfully the URL to the download queue."
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
                <div className={classes.root}>
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
                                        label="Spotify URL"
                                        style={{ margin: 8 }}
                                        placeholder="https://open.spotify.com/user/spotify/..."
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        onChange={this.handleInputChange}
                                        />
                                    </ListItem>  
                                    <Button variant="outlined" color="primary" className={classes.button} onClick={this.submit}>
                                        Download
                                    </Button>     
                                </List>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </Typography>
            <Dialog
                open={this.state.dialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                    {this.state.dialogText}
                    </DialogContentText>
                </DialogContent>
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