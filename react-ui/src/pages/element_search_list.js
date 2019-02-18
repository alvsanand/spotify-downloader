import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

/*
* Localization text
*/
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        album: "Album",
        by: "By",
    },
    es: {
        album: "Álbum",
        by: "Por",
    }
});

const tile_width = 300
const tile_height = 300

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
    },
    tile: {
        maxWidth: tile_width,
    },
    title: {
        color: theme.palette.primary.light,
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    image: {
        margin: 10,
        height: "auto",
        width: "auto",
        maxWidth: tile_width - 10,
        maxHeight: tile_height - 10,
    },
});

let last_number = -1;

function get_random_image() {
    let number = 0

    while ((number = Math.floor(Math.random() * 5)) === last_number) { }

    last_number = number;

    return `track_${number}.png`;
}

class SearchListItem extends React.Component {
    state = {
    };

    componentDidMount() {
    };

    componentWillUnmount() {
    };

    render() {
        const { classes, info } = this.props;
        const { name, url, image, album, artists, num_tracks } = this.props;

        let final_image = "";
        if (image !== "") {
            final_image = image
        }
        else {
            final_image = get_random_image();
        }

        return (
            <GridListTile className={classes.tile}>
                <img src={final_image} alt={name} className={classes.image} />
                <GridListTileBar
                    title={name}
                    classes={{
                        root: classes.titleBar,
                        title: classes.title,
                    }}
                    subtitle={
                        <div>
                            {album !== "" &&
                                <span>{txt.album}: {album}</span>
                            }
                            {album !== "" &&
                                <br />
                            }
                            {artists !== "" &&
                                <span>{txt.by}: {artists}</span>
                            }
                            {artists !== "" &&
                                <br />
                            }
                            {num_tracks > 1 &&
                                <span>#{num_tracks}</span>
                            }
                        </div>
                    }
                    actionIcon={
                        <IconButton className={classes.icon} onClick={() => info(url)}>
                            <InfoIcon color="secondary" />
                        </IconButton>
                    }
                />
            </GridListTile>
        )
    }
}

class SearchList extends React.Component {
    state = {
    };

    componentDidMount() {
    };

    componentWillUnmount() {
    };

    render() {
        const { classes, items, info } = this.props;

        if (!items) {
            return "";
        }

        let content = items.map((element, i) =>
            <SearchListItem
                key={element.url}
                name={element.name}
                url={element.url}
                image={element.image}
                album={element.album}
                artists={element.artists}
                num_tracks={element.num_tracks}
                info={info}
                classes={classes} />
        );

        if (items.length === 1) {
            //Fix bug in Material-UI
            return <ul style={{ listStyleType: "none" }}>{content}</ul>;
        }
        else {
            return (
                <GridList cellHeight={tile_height} className={classes.gridList} cols={2.5}>
                    {content}
                </GridList>
            );
        }
    }
}

SearchList.propTypes = {
    classes: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    info: PropTypes.func.isRequired,
};

export default withStyles(styles)(SearchList);