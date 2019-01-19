import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

import Config from '../config';
import Info from './element_info'

/*
* Localization text
*/
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        title: "Download",
        description: "Copy and paste a Spotify URL in the text field and click in \"Donwload\".",
        error_validation_title: "Validation error",
        error_validation_url: "Please enter a valid url.",
        error_already_added: "The URL is already in the download queue.",
        error_download: "Error while adding the URL to the download queue.",
        added_to_queue: "The URL has been added successfully to the download queue.",
        type_track: "Track",
        type_album: "Album",
        type_playlist: "Playlist",
        button_info: "Info",
        button_download: "Download",
        field_url: "Spotify URL"
    },
    es: {
        title: "Descargar",
        description: "Copie y pegue una URL de Spotify en el campo de texto y haga clic en \"Descargar\".",
        error_validation_title: "Error de validación",
        error_validation_url: "Por favor introduzca un URL válido",
        error_already_added: "La URL ya está en la cola de descarga.",
        error_download: "Error al agregar la URL a la cola de descarga.",
        added_to_queue: "La URL se ha agregado correctamente a la cola de descarga.",
        type_track: "Canción",
        type_album: "Álbum",
        type_playlist: "Listas de reproducción",
        button_info: "Info",
        button_download: "Descargar",
        field_url: "URL de Spotify"
    }
});

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
    title: {
        margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
    },
    icon: {
        position: "relative",
        top: theme.spacing.unit,
        width: theme.typography.display1.fontSize,
        height: theme.typography.display1.fontSize
    },
    image: {
        display: "block",
        'margin-left': "auto",
        'margin-right': "auto",
    },
    card: {
        display: 'flex',
        maxWidth: 500,
        maxHeight: 180,
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        width: 320,
    },
    cover: {
        width: 180,
        height: 180,
    },
});

export function download(url, sendNotification) {
    fetch(Config.API_SERVER_URL + "/download", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: url
        })
    })
        .then((response) => {
            if (!response.ok) throw Error(response.status);
            return response;
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.status === "OK") {
                    sendNotification("success", txt.added_to_queue);
                } else if (result.status === "ALREADY_ADDED") {
                    sendNotification("warning", txt.error_already_added);
                }
            },
            (error) => {
                sendNotification("error", txt.error_download);
            }
        )
        .catch((error) => {
            sendNotification("error", txt.error_download);
        });
};

class ContentDownload extends React.Component {
    validate() {
        if (!this.state.url || !/^https:\/\/open.spotify.com\/.+$/i.test(this.state.url)) {
            return {url: true}
        }
    
        return {};
    }

    state = {
        infoContent: "",
        errors: {}
    };

    download = () => {
        let errors = this.validate(this.state.url);        
        if (Object.keys(errors).length > 0) {
            this.setState({
                errors: errors
            });

            return;
        }
        

        this.setState({
            errors: {}
        });

        download(this.url, this.props.sendNotification);
    }

    info = (evt) => {
        let errors = this.validate(this.state.url);
        if (Object.keys(errors).length > 0) {
            this.setState({
                errors: errors
            });

            return;
        }

        this.setState({
            infoContent: <Info url={this.state.url} sendNotification={this.props.sendNotification} />,
            errors: {}
        });
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
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
                        <Grid container spacing={24}>
                            <Grid item xs={12}>
                                <List>
                                    <ListItem>
                                        <ListItemText>
                                            {txt.description}
                                        </ListItemText>
                                    </ListItem>
                                    <ListItem>
                                        <TextField
                                            name="url"
                                            error={'url' in this.state.errors && this.state.errors['url']}
                                            variant="outlined"
                                            label={txt.field_url}
                                            style={{ margin: 8 }}
                                            placeholder="https://open.spotify.com/..."
                                            fullWidth
                                            margin="normal"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            onChange={this.handleInputChange}
                                        />
                                        <Button variant="contained" color="secondary" className={classes.button} onClick={this.info}>
                                            {txt.button_info}
                                        </Button>
                                        <Button variant="contained" color="primary" className={classes.button} onClick={() => this.download(this.state.url)}>
                                            {txt.button_download}
                                        </Button>
                                    </ListItem>
                                    <ListItem>
                                        {this.state.infoContent}
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    </Paper>
                </Typography>
            </main>
        );
    }
}

ContentDownload.propTypes = {
    classes: PropTypes.object.isRequired,
    sendNotification: PropTypes.func.isRequired,
};

export default withStyles(styles)(ContentDownload);