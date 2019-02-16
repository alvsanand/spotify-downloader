import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import Config from '../config';
import Menu from './element_menu';
import { createComponent } from './element_content';
import Content from './element_content';
import SearchBar from './element_search_bar';
import Notification from './element_notification';

/*
* Localization text
*/
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        title: "Spotify Downloader",
    },
    es: {
        title: "Spotify Downloader",
    }
});

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    tableContainer: {
        height: 180,
    },
    h5: {
        marginBottom: theme.spacing.unit * 2,
    },
});

class SpotifyDownloader extends React.Component {
    sendNotification = (notType, notMessage) => {
        this.setState({
            notType:    notType,
            notMessage: notMessage,
            notOpen: true
        });
    }

    onCloseNotification = () => {
        this.setState({
            notOpen: false
        });
    };

    state = {
        open: false,
        mainConent: createComponent("Main", {}, this.sendNotification),
        runningDownloads: 0,
        notType: "info",
        notMessage: "",
        notOpen: false
    };

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    componentDidMount() {
        this.refresh_downloads_badge();

        this.interval = setInterval(() => this.refresh_downloads_badge(), Config.DOWNLOADS_BADGE_REFRESH_TIME);
    };

    componentWillUnmount() {
        clearInterval(this.interval);
    };

    search = (query) => {
        this.handleMainContent(createComponent("Search", {query: query}, this.sendNotification));
    };

    downloadHistory = (query) => {
        this.handleMainContent(createComponent("DownloadHistory", {}, this.sendNotification));
    };

    handleMainContent = (content) => {
        this.setState({ mainConent: content });
    };

    refresh_downloads_badge() {
        fetch(Config.API_SERVER_URL + "/download_history", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then((response) => {
            if (!response.ok) throw Error(response.status);
            return response;
        })
        .then(res => res.json())
        .then(
            (result) => {
                let runningDownloads = result.items.map((element, i) => {
                    if (element.status[0] === "STOPPED" || element.status[0] === "RUNNING") {
                        return 1;
                    } else {
                        return 0;
                    }
                }).reduce((a, b) => (a + b), 0);

                this.setState({
                    runningDownloads: runningDownloads
                });
            },
            (error) => {
                this.setState({
                    runningDownloads: 0
                });
            }
        )
        .catch((error) => {
            this.setState({
                runningDownloads: 0
            });
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="absolute" className={classNames(classes.appBar, this.state.open && classes.appBarShift)}>
                    <Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
                        <IconButton color="inherit" onClick={this.handleDrawerOpen}
                            className={classNames(
                                classes.menuButton,
                                this.state.open && classes.menuButtonHidden,
                            )}>
                            <MenuIcon />
                        </IconButton>
                        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                            {txt.title}
                        </Typography>
                        <SearchBar search={this.search} />

                        <IconButton color="inherit">
                            <Badge badgeContent={this.state.runningDownloads} onClick={this.downloadHistory} color="secondary">
                                <CloudDownloadIcon />
                            </Badge>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent"
                    classes={{
                        paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                    }} open={this.state.open}>
                    <div className={classes.toolbarIcon}>
                        <IconButton onClick={this.handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <Menu changeContent={this.handleMainContent} sendNotification={this.sendNotification}/>
                </Drawer>
                <Content content={this.state.mainConent}/>
                <Notification open={this.state.notOpen} onClose={this.onCloseNotification} variant={this.state.notType} message={this.state.notMessage}/>
            </div>
        );
    }
}

SpotifyDownloader.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SpotifyDownloader);