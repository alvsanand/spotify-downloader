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
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import LinearProgress from '@material-ui/core/LinearProgress';


import Config from '../config';
import Info from './element_info'
import SearchList from './element_search_list'
import { download as _download } from './content_download'

/*
* Localization text
*/
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        title: "Search",
        description: "Results for",
        error_search: "Error while searching.",
        album_title: "Albums",
        playlist_title: "Playlists",
        track_title: "Tracks",
        button_search: "Search",
        button_close: "Close",
        button_download: "Download",
        field_search: "Search terms",
    },
    es: {
        title: "Buscar",
        description: "Resultados para",
        error_search: "Error al buscar.",
        album_title: "Álbumes",
        playlist_title: "Listas de reproducciones",
        track_title: "Canciones",
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
});

class ContentSearch extends React.Component {
    state = {
        query: "",
        queryTitle: "",
        dialogContent: "",
        loading: false,
        items: []
    };

    search = (query) => {
        if (!query) {
            return
        }

        this.setState({ loading: true });

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
                        queryTitle: query,
                        loading: false
                    });
                },
                (error) => {
                    this.props.sendNotification("error", txt.error_search);
                    this.setState({
                        loading: false
                    });
                }
            )
            .catch((error) => {
                this.props.sendNotification("error", txt.error_search);
                this.setState({
                    loading: false
                });
            });
    };

    download = (url) => {
        _download(url, this.props.sendNotification);
    };

    info = (url) => {
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
                        <Info url={url} sendNotification={this.props.sendNotification} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => this.download(url)} color="secondary">
                            {txt.button_download}
                        </Button>
                        <Button variant="contained" onClick={() => this.setState({ infoContent: null })} color="primary">
                            {txt.button_close}
                        </Button>
                    </DialogActions>
                </Dialog>
        });
    }

    componentDidMount() {
        this.search(this.props.query);
    };

    componentWillUnmount() {
    };

    componentDidUpdate(prevProps) {
        if (this.props.query !== prevProps.query) {
            this.search(this.props.query);
        }
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
            album_items = items["album"];
        }

        let playlist_items = [];
        if (items && "playlist" in items) {
            playlist_items = items["playlist"];
        }

        let track_items = [];
        if (items && "track" in items) {
            track_items = items["track"];
        }

        return (
            <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <Typography variant="h4" gutterBottom component="h2">
                    {txt.title}
                </Typography>
                {this.state.loading &&
                    <LinearProgress color="secondary" />
                }
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
                                            <SearchList items={album_items} info={this.info} />
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
                                            <SearchList items={playlist_items} info={this.info} />
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
                                            <SearchList items={track_items} info={this.info} />
                                        </ListItem>
                                    }
                                </List>
                            </Grid>
                        </Grid>
                    </Paper>
                </Typography>
                {this.state.infoContent}
            </main>
        );
    }
}

ContentSearch.propTypes = {
    classes: PropTypes.object.isRequired,
    sendNotification: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
};

export default withStyles(styles)(ContentSearch);