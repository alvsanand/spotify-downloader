import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';

import Config from '../config';

/*
* Localization text
*/
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        title: "Settings",
        description: "Modify the configration of Spotify Downloader.",
        error_saving_settings: "Error while saving settings.",
        saved_settings: "Saved settings.",
        button_advanced: "Advanced",
        button_simple: "Simple",
        button_save: "Save",
    },
    es: {
        title: "Ajustes",
        description: "Modificar la configuración de Spotify Downloader.",
        error_saving_settings: "Error al guardar la configuración.",
        saved_settings: "Configuraciones guardadas.",
        button_advanced: "Avanzado",
        button_simple: "Sencillo",
        button_save: "Guardar"
    }
});

const settings_types = {
    'avconv': {
        type: "Boolean",
        advanced: true
    },
    'download_only_metadata': {
        type: "Boolean",
        advanced: true
    },
    'file_format': {
        type: "String",
        advanced: false
    },
    'folder': {
        type: "String",
        advanced: true
    },
    'input_ext': {
        type: "String",
        advanced: true
    },
    'log_level': {
        type: "String",
        advanced: true
    },
    'match_by_string_factor': {
        type: "Float",
        advanced: true
    },
    'max_downloads': {
        type: "Integer",
        advanced: false
    },
    'music_videos_only': {
        type: "Boolean",
        advanced: true
    },
    'no_metadata': {
        type: "Boolean",
        advanced: true
    },
    'no_spaces': {
        type: "Boolean",
        advanced: true
    },
    'output_ext': {
        type: "String",
        advanced: true
    },
    'overwrite': {
        type: "String",
        advanced: true
    },
    'cache_ttl': {
        type: "Integer",
        advanced: true
    },
    'search_format': {
        type: "String",
        advanced: true
    },
    'search_max_results': {
        type: "Integer",
        advanced: true
    },
    'spotify_auth.client_id': {
        type: "String",
        advanced: false
    },
    'spotify_auth.client_secret': {
        type: "String",
        advanced: false
    },
    'trim_silence': {
        type: "Boolean",
        advanced: true
    },
    'youtube_api_key': {
        type: "String",
        advanced: false
    },
}

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
    booleanMenu: {
        width: 200,
    },
});

class SettingsItem extends React.Component {
    state = {
        settings: {},
        advanced: false,
        errors: {}
    };

    render() {
        const { classes } = this.props;
        const { name, type, error, label, value, onChange } = this.props;

        let field
        if (type === "Boolean") {
            field =
                <TextField
                    required
                    name={name}
                    error={error}
                    variant="outlined"
                    label={label}
                    style={{ margin: 8 }}
                    select
                    fullWidth
                    margin="normal"
                    SelectProps={{
                        MenuProps: {
                            className: classes.booleanMenu,
                        },
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={value}
                    onChange={onChange}
                >
                    <MenuItem value={true}>True</MenuItem>
                    <MenuItem value={false}>False</MenuItem>
                </TextField>
        }
        else if (type === "Integer") {
            field =
                <TextField
                    required
                    name={name}
                    error={error}
                    type="number"
                    variant="outlined"
                    label={label}
                    style={{ margin: 8 }}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={value}
                    onChange={onChange}
                />
        }
        else if (type === "Float") {
            field =
                <TextField
                    required
                    name={name}
                    error={error}
                    type="number"
                    step="0.01"
                    variant="outlined"
                    label={label}
                    style={{ margin: 8 }}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={value}
                    onChange={onChange}
                />
        }
        else {
            field =
                <TextField
                    required
                    name={name}
                    error={error}
                    type="text"
                    variant="outlined"
                    label={label}
                    style={{ margin: 8 }}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={value}
                    onChange={onChange}
                />
        }

        return field;
    }
}

class ContentSettings extends React.Component {
    state = {
        settings: {},
        advanced: false,
        errors: {}
    };

    validate() {
        let errors = {};

        for (var property in this.state.settings) {
            if (this.state.settings.hasOwnProperty(property)) {
                if (this.state.settings[property] === "") {
                    errors[property] = true;
                }
            }
        }

        return errors;
    }

    save = (evt) => {
        let errors = this.validate(this.state.url);
        console.log(errors);
        if (Object.keys(errors).length > 0) {
            this.setState({
                errors: errors
            });

            return;
        }

        this.setState({
            errors: {}
        });

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
                        this.props.sendNotification("success", txt.saved_settings);
                    } else {
                        this.props.sendNotification("error", txt.error_saving_settings);
                    }
                },
                (error) => {
                    this.props.sendNotification("error", txt.error_saving_settings);
                }
            )
            .catch((error) => {
                this.props.sendNotification("error", txt.error_saving_settings);
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
                        settings: result.settings,
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
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;


        let type = "String"
        if (name in settings_types) {
            type = settings_types[name].type;
        }
        if (type === "Integer") {
            value = parseInt(value);
        }
        else if (type === "Boolean") {
            switch (value.toString().toLowerCase().trim()) {
                case "true": case "yes": case "1": value = true; break;
                case "false": case "no": case "0": case null: default: value = false; break;
            }
        }

        let settings = this.state.settings
        settings[name] = value

        this.setState({
            settings: settings
        });
    };

    render() {
        const { classes } = this.props;
        const { settings } = this.state;

        let fields = Object.keys(settings).map((key, i) => {
            let value = settings[key];
            let label = this.formatLabel(key);

            let type = "Default";
            let hidden = false;
            if (key in settings_types) {
                type = settings_types[key].type;

                hidden = !(!settings_types[key].advanced || this.state.advanced);
            }

            if (hidden) {
                return "";
            }

            let error = key in this.state.errors && this.state.errors[key]

            return (
                <ListItem key={key}>
                    <SettingsItem classes={classes} name={key} type={type} error={error} label={label} value={value} onChange={this.handleInputChange} />
                </ListItem>
            );
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
                                        <Button variant="contained" className={classes.button} onClick={() => this.setState({ advanced: !this.state.advanced })}>
                                            {!this.state.advanced && txt.button_advanced}
                                            {this.state.advanced && txt.button_simple}
                                        </Button>
                                        <Button variant="contained" color="primary" className={classes.button} onClick={this.save}>
                                            {txt.button_save}
                                        </Button>
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    </Paper>
                </Typography>
            </main>
        );
    }
}

ContentSettings.propTypes = {
    classes: PropTypes.object.isRequired,
    sendNotification: PropTypes.func.isRequired,
};

export default withStyles(styles)(ContentSettings);