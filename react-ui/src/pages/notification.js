import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

class NotificationContent extends React.Component {
    state = {
    };

    render() {
        const { classes, message, variant, onClose } = this.props;

        const Icon = variantIcon[variant];

        return (
            <SnackbarContent
            className={classes[variant]}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                <Icon className={classNames(classes.icon, classes.iconVariant)} />
                {message}
                </span>
            }
            action={[
                <IconButton
                key="close"
                color="inherit"
                className={classes.close}
                onClick={onClose}
                >
                <CloseIcon className={classes.icon} />
                </IconButton>,
            ]}
            />
        );
    }
}

NotificationContent.propTypes = {
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

const styles = theme => ({
    margin: {
      margin: theme.spacing.unit,
    },
    success: {
      backgroundColor: green[600],
    },
    error: {
      backgroundColor: theme.palette.error.dark,
    },
    info: {
      backgroundColor: theme.palette.primary.dark,
    },
    warning: {
      backgroundColor: amber[700],
    },
    icon: {
      fontSize: 20,
    },
    iconVariant: {
      opacity: 0.9,
      marginRight: theme.spacing.unit,
    },
    message: {
      display: 'flex',
      alignItems: 'center',
    },
});

class Notification extends React.Component {
    state = {
    };

    handleClose = (event, reason) => {
        const { onClose } = this.props;

        if (reason === 'clickaway') {
        return;
        }

        onClose();
    }

    render() {
        const { message, variant, classes } = this.props;

        return (
            <Snackbar
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                open={this.props.open}
                autoHideDuration={6000}
                onClose={this.handleClose}
            >
                <NotificationContent
                classes={classes}
                onClose={this.handleClose}
                variant={variant}
                message={message}
                />
            </Snackbar>
        );
    }
}

Notification.propTypes = {
  message: PropTypes.node,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

export default withStyles(styles)(Notification);