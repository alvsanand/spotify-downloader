import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CheckBox from '@material-ui/icons/CheckBox';

const styles = theme => ({
  root: {
    flexGrow: 1,
    maxWidth: "60%",
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

class ContentMain extends React.Component {
  state = {
    dense: false,
    secondary: false,
  };

  render() {
    const { classes } = this.props;
    const { dense } = this.state;

    return (
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Typography variant="h4" gutterBottom component="h2">
                Main
            </Typography>
            <Typography component="div" className={classes.mainContainer}>
                <div className={classes.root}>
                <Grid container spacing={16}>
                    <Grid item xs={12} md={12}>
                        <div className={classes.demo}>
                            <List dense={dense}>
                                <ListItem>
                                    <ListItemText>
                                    Downloads songs from YouTube in an MP3 format by using Spotify's HTTP link.
                                    </ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText>
                                    Can also download a song by entering its artist and song name (in case if you don't have the Spotify's HTTP link for some song).
                                    </ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText>
                                    Automatically applies metadata to the downloaded song which include:
                                    </ListItemText>
                                </ListItem>
                                <List component="div" disablePadding>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Title</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Artist</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Album</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Album art</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Lyrics (if found on http://lyrics.wikia.com)</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Album artist</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Genre</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Track number</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Disc number</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>Release date</ListItemText>
                                    </ListItem>
                                    <ListItem className={classes.nested}>
                                        <ListItemIcon>
                                            <CheckBox />
                                        </ListItemIcon>
                                       <ListItemText>And more...</ListItemText>
                                    </ListItem>
                                </List>
                                <ListItem>
                                    <ListItemText>
                                    Works straight out of the box and does not require to generate or mess with your API keys (already included).
                                    </ListItemText>
                                </ListItem>
                            </List>
                        </div>
                    </Grid>
                </Grid>
                </div>
            </Typography>
        </main>
    );
  }
}

ContentMain.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContentMain);