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

import ContentMain from './content_main';
import ContentDownload from './content_download';
import ContentDownloadHistory from './content_download_history';
import ContentSearch from './content_search';
import Settings from './content_settings';

/*
 * Localization text
 */
import LocalizedStrings from 'react-localization';
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

export const MenuContents = {
    "ContentMain": {
        content: <ContentMain />, 
        text: txt.menu_main,
        icon: <HomeIcon /> 
    },
    "Search": {
        content: <ContentSearch query=""/>,
        text: txt.menu_search,
        icon: <SearchIcon />
    },
    "ContentDownload": {
        content: <ContentDownload />,
        text: txt.menu_download,
        icon: <AddCircleIcon />
    },
    "ContentDownloadHistory": {
        content: <ContentDownloadHistory />,
        text: txt.menu_download_history,
        icon: <CloudDownloadIcon />
    },
    "Settings": {
        content: <Settings />,
        text: txt.menu_settings,
        icon: <SettingsIcon />
    }
};

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
});


class Menu extends React.Component {
    render() {
      const { classes } = this.props;
  
      let elements = Object.keys(MenuContents).map((key, i) => {
          let element = MenuContents[key]
          let icon
          if(element.icon){
            icon = (
            <ListItemIcon>
              {element.icon}
            </ListItemIcon>
            )
          }
  
          return (
            <ListItem button onClick={()=>this.props.changeContent(element.content)}  key={i}>
              {icon}
              <ListItemText inset={true} primary={element.text}/>
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
  };
  
  export default withStyles(styles)(Menu);
  