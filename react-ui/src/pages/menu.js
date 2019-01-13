import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import ContentMain from './content_main';
import ContentManualDownload from './content_manualDownload';
import ContentDownloads from './content_downloads';
import SettingsConfig from './content_settings';

export const MenuContents = [
    {
      content: <ContentMain />,
      text: 'Main',
      icon: <HomeIcon />
    },
    {
      content: <ContentManualDownload />,
      text: 'Manual Download',
    },
    {
      content: <ContentDownloads />,
      text: 'Downloads',
      icon: <CloudDownloadIcon />
    },
    {
      content: <SettingsConfig />,
      text: 'Settings',
      icon: <SettingsIcon />
    }
  ];

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

    let elements = MenuContents.map((element, i) => {
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
