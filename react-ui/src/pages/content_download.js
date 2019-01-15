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
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

import Config from './config';
import Notification from './notification';

/*
* Localization text
*/
import LocalizedStrings from 'react-localization';
let txt = new LocalizedStrings({
    en: {
        title: "Download",
        description: "Copy and paste a Spotify URL in the text field and click in \"Donwload\".",
        error_validation_title: "Validation error",
        error_validation_url: "Please enter a valid url.",
        error_already_added: "The URL is already in the download queue.",
        error_download: "Error while adding the URL to the download queue.",
        error_info: "Error while getting info about the URL.",
        added_to_queue: "The URL has been added successfully to the download queue.",
        album: "Album",
        by: "By",
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
        error_info: "Error al obtener información sobre la URL.",
        added_to_queue: "La URL se ha agregado correctamente a la cola de descarga.",
        album: "Álbumn",
        by: "Por",
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
    gridList: {
        width: 800,
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

class ContentDownload extends React.Component {
    state = {
        notType: "info",
        notMessage: "",
        notOpen: false,
        infoContent: ""
    };

    validate() {
        if (!this.state.url || !/^https:\/\/open.spotify.com\/.+$/i.test(this.state.url)) {
            return txt.error_validation_url
        }

        return "";
    }

    download = (evt) => {
        let validation_error = this.validate();
        if (validation_error !== "") {
            this.setState({
                notType: "error",
                notMessage: txt.error_validation_title + ": " + validation_error,
                notOpen: true
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
            .then((response) => {
                if (!response.ok) throw Error(response.status);
                return response;
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.status === "OK") {
                        this.setState({
                            notType: "success",
                            notMessage: txt.added_to_queue,
                            notOpen: true
                        });
                    } else if (result.status === "ALREADY_ADDED") {
                        this.setState({
                            notType: "warning",
                            notMessage: txt.error_already_added,
                            notOpen: true
                        });
                    }
                },
                (error) => {
                    this.setState({
                        notType: "error",
                        notMessage: txt.error_download,
                        notOpen: true
                    });
                }
            )
            .catch((error) => {
                this.setState({
                    notType: "error",
                    notMessage: txt.error_download,
                    notOpen: true
                });
            });
    };

    getInfo = (evt) => {
        const { classes } = this.props;

        let validation_error = this.validate();
        if (validation_error !== "") {
            this.setState({
                notType: "error",
                notMessage: txt.error_validation_title + ": " + validation_error,
                notOpen: true
            });

            return;
        }

        fetch(Config.API_SERVER_URL + "/info", {
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
                    let image = "track.png"
                    if (result.image && result.image !== "") {
                        image = result.image
                    }

                    let tracks = "";
                    if(result.type !== 'TRACK'){
                        tracks = result.tracks.map((element, i) => {
                            return (
                                <GridListTile key={i} style={{ height: '180px' }}>
                                    <img src="track.png" className={classes.image} alt={element.name} />
                                    <GridListTileBar
                                        title={element.name}
                                        subtitle={
                                            <div>
                                                <span>{txt.album}: {element.album}</span>
                                                <br /><br />
                                                {element.artists !== "" &&
                                                    <span>{txt.by}: {element.artists}</span>
                                                }
                                            </div>
                                        }
                                    />
                                </GridListTile>
                            )
                        });
                    }

                    this.setState({
                        infoContent:
                            <div>
                                <Card className={classes.card}>
                                    <div className={classes.details}>
                                        <CardContent className={classes.content}>
                                            <Typography component="h5" variant="h5">
                                                {result.name}
                                            </Typography>
                                            {result.album !== "" &&
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    {txt.album}: {result.album}
                                                </Typography>
                                            }
                                            {result.description !== "" &&
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    {txt.by}: {result.description}
                                                </Typography>
                                            }
                                            {result.artists !== "" &&
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    {txt.by}: {result.artists}
                                                </Typography>
                                            }
                                        </CardContent>
                                    </div>
                                    <CardMedia
                                        className={classes.cover}
                                        image={image}
                                        title={result.name}
                                    />
                                </Card>
                                {tracks !=="" &&
                                <br />
                                }
                                {tracks !=="" &&
                                <GridList cols={3} cellHeight={180} spacing={2} className={classes.gridList}>
                                    {tracks}
                                </GridList>
                                }
                            </div>
                    });
                },
                (error) => {
                    this.setState({
                        notType: "error",
                        notMessage: txt.error_info,
                        notOpen: true
                    });
                }
            )
            .catch((error) => {
                this.setState({
                    notType: "error",
                    notMessage: txt.error_info,
                    notOpen: true
                });
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

    onCloseNotification = () => {
        this.setState({
            notOpen: false
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
                                        <Button variant="contained" color="secondary" className={classes.button} onClick={this.getInfo}>
                                            {txt.button_info}
                                        </Button>
                                        <Button variant="contained" color="primary" className={classes.button} onClick={this.download}>
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
                <Notification open={this.state.notOpen} onClose={this.onCloseNotification} variant={this.state.notType} message={this.state.notMessage} />
            </main>
        );
    }
}

ContentDownload.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContentDownload);