import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';
import DoneIcon from '@material-ui/icons/Done';
import CircularProgress from '@material-ui/core/CircularProgress';
import CancelIcon from '@material-ui/icons/Cancel';
import RefreshIcon from '@material-ui/icons/Refresh';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Config from '../config';

/*
* Localization text
*/
import LocalizedStrings from '../LocalizedStrings';
let txt = new LocalizedStrings({
    en: {
        title: "Download History",
        description: "Here, you can see all the downloads.",
        table_column_name: "Name",
        table_column_url: "URL",
        table_column_init_date: "Init time",
        table_column_end_date: "End time",
        table_column_status: "Status",
        button_refresh: "Refresh",
        error_load: "Error while getting info about the downloads.",
    },
    es: {
        title: "Historial de Descargas",
        description: "Aquí puedes ver todas las descargas.",
        table_column_name: "Nombre",
        table_column_url: "URL",
        table_column_init_date: "Hora Inicio",
        table_column_end_date: "Hora Fin",
        table_column_status: "Estado",
        button_refresh: "Refrescar",
        error_load: "Error al obtener información sobre las descargas.",
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
});

class ContentDownload extends React.Component {
    state = {
        items: []
    };

    refresh() {
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
                this.setState({
                    items: result.items
                });
            },
            (error) => {
                this.setState({
                    items: []
                });
                this.props.sendNotification("error", txt.error_load);
            }
        )
        .catch((error) => {
            this.setState({
                items: []
            });
            this.props.sendNotification("error", txt.error_load);
        });
    };

    componentDidMount() {
        this.refresh();

        this.interval = setInterval(() => this.refresh(), Config.DOWNLOADS_REFRESH_TIME);
    };

    componentWillUnmount() {
        clearInterval(this.interval);
    };


    render() {
        const { classes } = this.props;
        const { items } = this.state;

        let rows = items.map((element, i) => {
            let icon = element.status
            let status = element.status.code
            let statusMessage = element.status.description
            let progress = element.status.progress
            if (status === "FINISHED") {
                icon = <DoneIcon titleAccess={statusMessage}/>
            } else if (status === "ERROR") {
                icon = <ErrorIcon titleAccess={statusMessage}/>
            } else if (status === "RUNNING") {
                icon = <div title={statusMessage}>
                            <CircularProgress
                                variant="static"
                                value={100 * (progress.current / progress.total)}
                                color="primary"
                            />
                        </div>
            } else if (status === "CANCELLED") {
                icon = <CancelIcon titleAccess={statusMessage}/>
            } else if (status === "STOPPED") {
                icon = <QueryBuilderIcon titleAccess={statusMessage}/>
            }

            return (
                <TableRow key={i}>
                    <TableCell component="th" scope="row">
                        {element.name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {element.url}
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {element.init_date}
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {element.end_date}
                    </TableCell>
                    <TableCell align="right">
                        {icon}
                    </TableCell>
                </TableRow>
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
                                    <ListItem>
                                        <Table className={classes.table}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{txt.table_column_name}</TableCell>
                                                    <TableCell>{txt.table_column_url}</TableCell>
                                                    <TableCell>{txt.table_column_init_date}</TableCell>
                                                    <TableCell>{txt.table_column_end_date}</TableCell>
                                                    <TableCell align="right">{txt.table_column_status}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows}
                                            </TableBody>
                                            <TableFooter className={classes.footer}>
                                                <TableRow>
                                                    <TableCell>
                                                        <Button size="small" variant="contained" onClick={() => this.refresh()}>
                                                            <RefreshIcon />
                                                            {txt.button_refresh}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
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

ContentDownload.propTypes = {
    classes: PropTypes.object.isRequired,
    sendNotification: PropTypes.func.isRequired,
};

export default withStyles(styles)(ContentDownload);