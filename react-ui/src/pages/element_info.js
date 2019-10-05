import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import PlayArrow from '@material-ui/icons/PlayArrow';
import MusicVideo from '@material-ui/icons/MusicVideo';

import Config from '../config';

/*
* Localization text
*/
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        error_info: "Error while getting info about the URL.",
        album: "Album",
        by: "By",
        table_column_name: "NAME",
        table_column_artits: "ARTIST",
        table_column_album: "ALBUM",
        button_play_spotify: "Play in Spotify",
        button_play_youtube: "Play in Youtube",
    },
    es: {
        error_info: "Error al obtener información sobre la URL.",
        album: "Álbum",
        by: "Por",
        table_column_name: "NOMBRE",
        table_column_artits: "ARTISTA",
        table_column_album: "ÁLBUMN",
        button_play_spotify: "Escuchar en Spotify",
        button_play_youtube: "Escuchar en Youtube",
    }
});

const styles = theme => ({
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
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
});

class Info extends React.Component {
    state = {
        result: null
    };

    load = (url) => {
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
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        result: result
                    });
                },
                (error) => {
                    this.setState({
                        result: null
                    });
                    this.props.sendNotification("error", txt.error_info);
                }
            )
            .catch((error) => {
                this.setState({
                    result: null
                });
                this.props.sendNotification("error", txt.error_info);
            });
    }

    componentDidMount() {
        this.load(this.props.url);
    };

    componentWillUnmount() {
    };

    play_spotify(_link) {
        return (event) => {
            event.preventDefault();

            let link = ""
            if (_link.indexOf("?") >= 0) {
                link = _link + "&play"
            }
            else {
                link = _link + "?play"
            }

            window.open(link);
        }
    };

    play_youtube(_link) {
        return (event) => {
            event.preventDefault();

            let link = Config.API_SERVER_URL + "/youtube?url=" + _link

            window.open(link);
        }
    };

    render() {
        const { classes } = this.props;
        const { result } = this.state;

        if (result == null) {
            return ""
        }

        let image = "track.png"
        if (result.image && result.image !== "") {
            image = result.image
        }

        let tracks = "";
        if (result.tracks != null && result.type !== 'TRACK') {
            tracks = result.tracks.map((element, i) => {
                return (
                    <TableRow key={i}>
                        <TableCell>
                            {i + 1}
                        </TableCell>
                        <TableCell>
                            {element.name}
                        </TableCell>
                        <TableCell>
                            {element.artists}
                        </TableCell>
                        <TableCell>
                            {element.album}
                        </TableCell>
                        <TableCell align="right">
                            <IconButton variant="extended" aria-label={txt.button_play_spotify} onClick={this.play_spotify(element.url)}>
                                <PlayArrow />
                            </IconButton>
                            <IconButton variant="extended" aria-label={txt.button_play_youtube} onClick={this.play_youtube(element.url)}>
                                <MusicVideo />
                            </IconButton>
                        </TableCell>
                    </TableRow>
                )
            });
        }

        return (
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
                                    {result.description}
                                </Typography>
                            }
                            {result.artists !== "" &&
                                <Typography variant="subtitle2" color="textSecondary">
                                    {txt.by}: {result.artists}
                                </Typography>
                            }
                            <div className={classes.controls}>
                                <IconButton variant="extended" aria-label={txt.button_play_spotify} onClick={this.play_spotify(result.url)}>
                                    <PlayArrow />
                                </IconButton>
                                {result.type === 'TRACK' &&
                                <IconButton variant="extended" aria-label={txt.button_play_youtube} onClick={this.play_youtube(result.url)}>
                                    <MusicVideo />
                                </IconButton>
                                }
                            </div>
                        </CardContent>
                    </div>
                    <CardMedia
                        className={classes.cover}
                        image={image}
                        title={result.name}
                    />
                </Card>
                {tracks !== "" &&
                    <br />
                }
                {tracks !== "" &&
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>{txt.table_column_name}</TableCell>
                                <TableCell>{txt.table_column_artits}</TableCell>
                                <TableCell>{txt.table_column_album}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tracks}
                        </TableBody>
                    </Table>
                }
            </div>
        );
    }
}

Info.propTypes = {
    classes: PropTypes.object.isRequired,
    sendNotification: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
};

export default withStyles(styles)(Info);