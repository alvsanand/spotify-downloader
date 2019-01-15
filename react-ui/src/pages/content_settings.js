import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';

import Notification from './notification';
import Config from './config';

/*
* Localization text
*/
import LocalizedStrings from 'react-localization';
let txt = new LocalizedStrings({
    en: {
        title: "Settings",
        description: "Modify the configration of Spotify Downloader.",
        error_saving_settings: "Error while saving settings.",
        saved_settings: "Saved settings.",
        button_save: "Save"
    },
    es: {
        title: "Ajustes",
        description: "Modificar la configuración de Spotify Downloader.",
        error_saving_settings: "Error al guardar la configuración.",
        saved_settings: "Configuraciones guardadas.",
        button_save: "Guardar"
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
        position: "relative",
        top: theme.spacing.unit,
        width: theme.typography.display1.fontSize,
        height: theme.typography.display1.fontSize
    },
});

class Settings extends React.Component {
    state = {
        notType: "info",
        notMessage: "",
        notOpen: false,
        settings: {}
    };

    save = (evt) => {
        fetch(Config.API_SERVER_URL + "/settings", {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                settings: this.state.settings
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
                        notType:    "success",
                        notMessage: txt.saved_settings,
                        notOpen: true
                    });
                } else {
                    this.setState({
                        notType:    "error",
                        notMessage: txt.error_saving_settings,
                        notOpen: true
                    });
                }
            },
            (error) => {
                this.setState({
                    notType:    "error",
                    notMessage: txt.error_saving_settings,
                    notOpen: true
                });
            }
        )
        .catch((error) => {
            this.setState({
                notType:    "error",
                notMessage: txt.error_saving_settings,
                notOpen: true
            });
        });
    };

    load() {
        fetch(Config.API_SERVER_URL + "/settings", {
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
                this.setState({
                    settings: result.settings
                });
            },
            (error) => {
                this.setState({
                    settings: {}
                });
            }
        )
        .catch((error) => {
            this.setState({
                settings: {}
            });
        });
    };

    componentDidMount() {
        this.load();
    };

    componentWillUnmount() {
    };

    formatLabel(_label) {
        let label = _label.replace(/[_]/g, " ").replace(/[.]/g, " - ");

        return label.charAt(0).toUpperCase() + label.slice(1);
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let settings = this.state.settings
        settings[name] = value

        this.setState({
            settings: settings
        });
    };

    onCloseNotification = () => {
        this.setState({
            notOpen: false
        });
    };

    render() {
        const { classes } = this.props;
        const { settings } = this.state;

        let fields = Object.keys(settings).map((key, i) => {
            let value = settings[key];
            let label = this.formatLabel(key);

            return (
                <ListItem key={i}>
                    <TextField
                        name={key}
                        variant="outlined"
                        label={label}
                        style={{ margin: 8 }}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={value}
                        onChange={this.handleInputChange}
                    />
                </ListItem>
            )
        });

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
                                    {fields}
                                    <ListItem>
                                        <Button variant="contained" color="primary" className={classes.button} onClick={this.save}>
                                        {txt.button_save}
                                        </Button>
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    </Paper>
                </Typography>
                <Notification open={this.state.notOpen} onClose={this.onCloseNotification} variant={this.state.notType} message={this.state.notMessage}/>
            </main>
        );
    }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Settings);