import React from 'react';
import {
    withStyles
} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import SearchIcon from '@material-ui/icons/Search';


import { createComponent } from './element_content';

/*
 * Localization text
 */
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        menu_main: "Main",
        menu_download: "Download",
        menu_download_history: "Download History",
        menu_search: "Search",
        menu_settings: "Settings",
    },
    es: {
        menu_main: "principal",
        menu_download: "Descargar",
        menu_download_history: "Historial de Descargas",
        menu_search: "Buscar",
        menu_settings: "Ajuster",
    }
});

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
});

const MenuContents = {
    "Main": {
        text: txt.menu_main,
        icon: <HomeIcon />
    },
    "Search": {
        text: txt.menu_search,
        icon: <SearchIcon />
    },
    "Download": {
        text: txt.menu_download,
        icon: <AddCircleIcon />
    },
    "DownloadHistory": {
        text: txt.menu_download_history,
        icon: <CloudDownloadIcon />
    },
    "Settings": {
        text: txt.menu_settings,
        icon: <SettingsIcon />
    }
};

class Menu extends React.Component {

    render() {
        const { classes } = this.props;

        let elements = Object.keys(MenuContents).map((key, i) => {
            let element = MenuContents[key]
            let icon
            if (element.icon) {
                icon = (
                    <ListItemIcon>
                        {element.icon}
                    </ListItemIcon>
                )
            }

            return (
                <ListItem button onClick={() => this.props.changeContent(createComponent(key, {}, this.props.sendNotification))} key={i}>
                    {icon}
                    <ListItemText inset={true} primary={element.text} />
                </ListItem>
            )
        });

        return (
            <List component="nav" className={classes.root}>
                {elements}
            </List>
        )
    }
}

Menu.propTypes = {
    classes: PropTypes.object.isRequired,
    sendNotification: PropTypes.func.isRequired,
};

export default withStyles(styles)(Menu);
