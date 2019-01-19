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
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        title: "Main",
        content:
            <List>
                <ListItem><ListItemText>This is a more user friendly version of the fantastic <a href="https://github.com/ritiek/spotify-downloader">Spotify Downloader</a> from <a href="https://github.com/ritiek">ritiek</a>.</ListItemText></ListItem>
                <ListItem><ListItemText></ListItemText></ListItem>
                <ListItem><ListItemText>This is a list of some of its features:</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Downloads songs from YouTube in an MP3 format by using Spotify metadata.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Functional UI based on ReactJS and MATERIAL-UI.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Search for songs, albums and playlist or simply copy the Spotify's HTTP link.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Fetch info from Spotify and play the songs using its web player.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Automatically applies metadata to the downloaded song</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Works straight out of the box and does not require to generate or mess with your API keys (already included).</ListItemText></ListItem>
            </List>
    },
    es: {
        title: "Principal",
        content: 
            <List>
                <ListItem><ListItemText>Esta es una versión más fácil de usar del fantástico <a href="https://github.com/ritiek/spotify-downloader"> Spotify Downloader </a> de <a href = "https: //github.com/ritiek">ritiek </a>.</ListItemText></ListItem>
                <ListItem><ListItemText></ListItemText></ListItem>
                <ListItem><ListItemText>Esta es una lista de algunas de sus características:</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Descarga canciones de YouTube en formato MP3 utilizando los metadatos de Spotify.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>UI funcional basada en ReactJS y MATERIAL-UI.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Busque canciones, álbumes y listas de reproducción o simplemente copie el enlace HTTP de Spotify.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Obtenga información de Spotify y reproduzca las canciones utilizando su reproductor web.</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Aplica automáticamente los metadatos a la canción descargada</ListItemText></ListItem>
                <ListItem><CheckBox/><ListItemText>Funciona de forma inmediata y no requiere generar ni desordenar sus claves API (ya incluidas).</ListItemText></ListItem>
            </List>
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
    sendNotification: PropTypes.func.isRequired,
};

export default withStyles(styles)(ContentMain);