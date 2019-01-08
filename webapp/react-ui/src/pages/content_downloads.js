import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';
import DoneIcon from '@material-ui/icons/Done';
import CachedIcon from '@material-ui/icons/Cached';

const styles = theme => ({
  root: {
    flexGrow: 1,
    maxWidth: "60%",
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
  demo: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
  },
});

const URL = "http://127.0.0.1:5000"

class ContentManualDownload extends React.Component {
  state = {
    items: [],
  };

  validate() {
    if (!this.state.url || !/^https:\/\/open.spotify.com\/user\/spotify\/.+$/i.test(this.state.url)) {
      return 'Please enter a valid url'
    }
    
    return "";
  }

  componentDidMount() {
    fetch(URL + "/downloads", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            items: result
          });
        },
        (error) => {
          this.setState({
            items: []
          });
        }
      )
  };


  render() {
    const { classes } = this.props;
    const { items } = this.state;

    let rows = items.map((element, i) => {
      let icon = element.status
      if(element.status === "FINISHED"){
        icon = <DoneIcon />
      } else if(element.status === "ERROR"){
        icon = <ErrorIcon />
      } else if(element.status === "RUNNING"){
        icon = <CachedIcon />
      }

      return (
        <TableRow key={i}>
          <TableCell component="th" scope="row">
            {element.name}
          </TableCell>
          <TableCell component="th" scope="row">
            {element.url}
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
            Downloads
            </Typography>
            <Typography component="div" className={classes.mainContainer}>
                <div className={classes.root}>
                    <Grid container spacing={24}>
                        <Grid item xs={12}>
                          <Table className={classes.table}>
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Url</TableCell>
                                <TableCell align="right">Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows}
                            </TableBody>
                          </Table> 
                        </Grid>
                    </Grid>
                </div>
            </Typography>
        </main>
    );
  }
}

ContentManualDownload.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContentManualDownload);