import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CheckBox from '@material-ui/icons/CheckBox';
import { Paper } from '@material-ui/core';

/*
* Localization text
*/
import LocalizedStrings from 'react-localization';
let txt = new LocalizedStrings({
    en: {
        title: "Main",
        content: 
            <List>
                <ListItem>
                    <ListItemText>Downloads songs from YouTube in an MP3 format by using Spotify's HTTP link.</ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>Can also download a song by entering its artist and song name (in case if you don't have the Spotify's HTTP link for some song).</ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>Automatically applies metadata to the downloaded song which include:</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Title</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Artist</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Album</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Album art</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Lyrics (if found on http://lyrics.wikia.com)</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Album artist</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Genre</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Track number</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Disc number</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>Release date</ListItemText>
                </ListItem>
                <ListItem>
                    <CheckBox /><ListItemText>And more...</ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>That's how your music library will look like!</ListItemText>
                </ListItem>
                <ListItem>
                    <img src="http://i.imgur.com/Gpch7JI.png" alt="Screenshot 1" width="290" /><img src="http://i.imgur.com/5vhk3HY.png" alt="Screenshot 2" width="290" /><img src="http://i.imgur.com/RDTCCST.png" alt="Screenshot 3" width="290" />
                </ListItem>
            </List>
    },
    es: {
        title: "Principal"
    }
});

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        height: '100vh',
        overflow: 'auto',
    },
    appBarSpacer: theme.mixins.toolbar,
    title: {
        margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
    },
});

class ContentMain extends React.Component {
    state = {
        secondary: false,
    };

    render() {
        const { classes } = this.props;

        return (
            <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <Typography variant="h4" gutterBottom component="h2">
                    {txt.title}
                </Typography>
                <Typography component="div" className={classes.mainContainer}>
                    <Paper>
                        <Grid container spacing={16}>
                            <Grid item xs={12} md={12}>
                                {txt.content}
                            </Grid>
                        </Grid>
                    </Paper>
                </Typography>
            </main>
        );
    }
}

ContentMain.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContentMain);