import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import AlbumIcon from '@material-ui/icons/Album';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import { Paper } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';


import Config from './config';
import Notification from './notification';

/*
* Localization text
*/
import LocalizedStrings from 'react-localization';
let txt = new LocalizedStrings({
    en: {
        title: "Search",
        description: "Results for",
        error_search: "Error while searching.",
        error_validation_title: "Validation error",
        error_already_added: "The URL is already in the download queue.",
        error_download: "Error while adding the URL to the download queue.",
        error_info: "Error while getting info about the URL.",
        added_to_queue: "The URL has been added successfully to the download queue.",
        album_title: "Albums",
        playlist_title: "Playlists",
        track_title: "Tracks",
        album: "Album",
        by: "By",
        table_column_name: "Name",
        table_column_url: "URL",
        table_column_num_tracks: "# tracks",
        button_search: "Search",
        button_close: "Close",
        button_download: "Download",
        field_search: "Search terms",
    },
    es: {
        title: "Buscar",
        description: "Resultados para",
        error_search: "Error al buscar.",
        error_validation_title: "Error de validación",
        error_already_added: "La URL ya está en la cola de descarga.",
        error_download: "Error al agregar la URL a la cola de descarga.",
        error_info: "Error al obtener información sobre la URL.",
        added_to_queue: "La URL se ha agregado correctamente a la cola de descarga.",
        album_title: "Álbumnes",
        playlist_title: "Listas de reproducciones",
        track_title: "Canciones",
        album: "Álbumn",
        by: "Por",
        table_column_name: "Nombre",
        table_column_url: "URL",
        table_column_num_tracks: "# canciones",
        button_search: "Buscar",
        button_close: "Cerrar",
        button_download: "Descargar",
        field_search: "Términos de búsqueda"
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
    footer: {
        padding: "5px 10px"
    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
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
    dialog: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: 800,
        height: 500
    },
});

class ContentSearch extends React.Component {
    state = {
        notType: "info",
        notMessage: "",
        notOpen: false,
        query: "",
        queryTitle: "",
        dialogContent: "",
        items: []
    };

    search = (query) => {
        if (!query) {
            return
        }

        fetch(Config.API_SERVER_URL + "/search", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query
            })
        })
            .then((response) => {
                if (!response.ok) throw Error(response.status);
                return response;
            })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        items: result,
                        query: query,
                        queryTitle: query
                    });
                },
                (error) => {
                    this.setState({
                        notType: "error",
                        notMessage: txt.error_search,
                        notOpen: true,
                        items: []
                    });
                }
            )
            .catch((error) => {
                this.setState({
                    notType: "error",
                    notMessage: txt.error_search,
                    notOpen: true,
                    items: []
                });
            });
    };

    download = (url) => {
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

    handleClose = () => {
        this.setState({
            infoContent: ""
        });
    }


    getInfo = (url) => {
        const { classes } = this.props;

        fetch(Config.API_SERVER_URL + "/info", {
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
                                                <span>{txt.album_title}: {element.album}</span>
                                                {element.artists !== "" &&
                                                    <br />
                                                }
                                                {element.artists !== "" &&
                                                    <br />
                                                }
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
                            <Dialog
                                maxWidth="xl"
                                scroll="paper"
                                open={true}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogContent>
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
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="contained" onClick={() => this.download(result.url)} color="secondary">
                                        {txt.button_download}
                                    </Button>
                                    <Button variant="contained" onClick={this.handleClose} color="primary">
                                        {txt.button_close}
                                    </Button>
                                </DialogActions>
                            </Dialog>
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
    };

    componentDidMount() {
    };

    componentWillUnmount() {
    };

    componentDidUpdate(prevProps) {
        if (this.props.query !== prevProps.query) {
            this.search(this.props.query);
        }
    };

    onCloseNotification = () => {
        this.setState({
            notOpen: false
        });
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    };

    handleEnter = (event) => {
        if (event.key === 'Enter') {
            this.search(this.state.query);
        }
    };

    render() {
        const { classes } = this.props;
        const { items } = this.state;

        let album_items = [];
        if (items && "album" in items) {
            album_items = items["album"].map((element, i) => {
                let image = "track.png"
                if (element.image && element.image !== "") {
                    image = element.image
                }

                return (
                    <GridListTile key={i} style={{ height: '180px' }}>
                        <img src={image} className={classes.image} alt={element.name} />
                        <GridListTileBar
                            title={element.name}
                            subtitle={
                                <div>
                                    <span>{txt.album}: {element.album}</span><br />
                                    {element.artists !== "" &&
                                        <span>{txt.by}: {element.artists}</span>
                                    }
                                    {element.artists !== "" &&
                                        <br />
                                    }
                                    <span>#{element.num_tracks}</span>
                                </div>
                            }
                            actionIcon={
                                <IconButton className={classes.icon} onClick={() => this.getInfo(element.url)}>
                                    <InfoIcon />
                                </IconButton>
                            }
                        />
                    </GridListTile>
                )
            });
        }

        let playlist_items = [];
        if (items && "playlist" in items) {
            playlist_items = items["playlist"].map((element, i) => {
                let image = "track.png"
                if (element.image && element.image !== "") {
                    image = element.image
                }

                return (
                    <GridListTile key={i} style={{ height: '180px' }}>
                        <img src={image} className={classes.image} alt={element.name} />
                        <GridListTileBar
                            title={element.name}
                            subtitle={
                                <div>
                                    {element.artists !== "" &&
                                        <span>{txt.by}: {element.artists}</span>
                                    }
                                    {element.artists !== "" &&
                                        <br />
                                    }
                                    <span>#{element.num_tracks}</span>
                                </div>
                            }
                            actionIcon={
                                <IconButton className={classes.icon} onClick={() => this.getInfo(element.url)}>
                                    <InfoIcon />
                                </IconButton>
                            }
                        />
                    </GridListTile>
                )
            });
        }

        let track_items = [];
        if (items && "track" in items) {
            track_items = items["track"].map((element, i) => {
                let image = "track.png"
                if (element.image && element.image !== "") {
                    image = element.image
                }

                return (
                    <GridListTile key={i} style={{ height: '180px' }}>
                        <img src={image} className={classes.image} alt={element.name} />
                        <GridListTileBar
                            title={element.name}
                            subtitle={
                                <div>
                                    {element.artists !== "" &&
                                        <span>{txt.by}: {element.artists}</span>
                                    }
                                    {element.artists !== "" &&
                                        <br />
                                    }
                                </div>
                            }
                            actionIcon={
                                <IconButton className={classes.icon} onClick={() => this.getInfo(element.url)}>
                                    <InfoIcon />
                                </IconButton>
                            }
                        />
                    </GridListTile>
                )
            });
        }

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
                                        <TextField
                                            name="query"
                                            variant="outlined"
                                            label={txt.field_search}
                                            style={{ margin: 8 }}
                                            placeholder="..."
                                            fullWidth
                                            margin="normal"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            onChange={this.handleInputChange}
                                            value={this.state.query}
                                            onKeyUp={this.handleEnter}
                                        />
                                        <Button variant="contained" color="secondary" className={classes.button} onClick={() => this.search(this.state.query)}>
                                            {txt.button_search}
                                        </Button>
                                    </ListItem>
                                    {album_items.length > 0 && playlist_items.length > 0 && track_items.length > 0 &&
                                        <ListItem>
                                            <Typography variant="h5" gutterBottom component="h3">
                                                <SearchIcon /> {txt.description} "{this.state.queryTitle}"
                                        </Typography>
                                        </ListItem>
                                    }
                                    {album_items.length > 0 &&
                                        <ListItem>
                                            <ListItemText>
                                                <AlbumIcon /> {txt.album_title}:
                                        </ListItemText>
                                        </ListItem>
                                    }
                                    {album_items.length > 0 &&
                                        <ListItem>
                                            <GridList cols={3} cellHeight={180} spacing={2} className={classes.gridList}>
                                                {album_items}:
                                        </GridList>
                                        </ListItem>
                                    }
                                    {playlist_items.length > 0 &&
                                        <ListItem>
                                            <ListItemText>
                                                <PlaylistPlayIcon /> {txt.playlist_title}:
                                        </ListItemText>
                                        </ListItem>
                                    }
                                    {playlist_items.length > 0 &&
                                        <ListItem>
                                            <GridList cols={3} cellHeight={180} spacing={2} className={classes.gridList}>
                                                {playlist_items}
                                            </GridList>
                                        </ListItem>
                                    }
                                    {track_items.length > 0 &&
                                        <ListItem>
                                            <ListItemText>
                                                <AudiotrackIcon /> {txt.track_title}
                                            </ListItemText>
                                        </ListItem>
                                    }
                                    {track_items.length > 0 &&
                                        <ListItem>
                                            <GridList cols={3} cellHeight={180} spacing={2} className={classes.gridList}>
                                                {track_items}
                                            </GridList>
                                        </ListItem>
                                    }
                                </List>
                            </Grid>
                        </Grid>
                    </Paper>
                </Typography>
                <Notification open={this.state.notOpen} onClose={this.onCloseNotification} variant={this.state.notType} message={this.state.notMessage} />
                {this.state.infoContent}
            </main>
        );
    }
}

ContentSearch.propTypes = {
    classes: PropTypes.object.isRequired,
    query: PropTypes.string.isRequired,
};

export default withStyles(styles)(ContentSearch);