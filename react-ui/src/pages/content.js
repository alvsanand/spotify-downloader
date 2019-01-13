import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
});

class Content extends React.Component {
    render() {
        return this.props.content
    }
}


export default withStyles(styles)(Content);
