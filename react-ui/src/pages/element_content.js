import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import ContentMain from './content_main';
import ContentDownload from './content_download';
import ContentDownloadHistory from './content_download_history';
import ContentSearch from './content_search';
import ContentSettings from './content_settings';

const styles = theme => ({
    content: {
        maxWidth: 600,
    },
});

export function createComponent(component, parameters, sendNotification) {
    if (component === "Main") {
        return <ContentMain sendNotification={sendNotification} />;
    }
    if (component === "Search") {
        let query = "";
        if ("query" in parameters) {
            query = parameters["query"];
        }

        return <ContentSearch query={query} sendNotification={sendNotification} />;
    }
    if (component === "Download") {
        return <ContentDownload sendNotification={sendNotification} />;
    }
    if (component === "DownloadHistory") {
        return <ContentDownloadHistory sendNotification={sendNotification} />;
    }
    if (component === "Settings") {
        return <ContentSettings sendNotification={sendNotification} />;
    }

    return null;
}

class Content extends React.Component {
    render() {
        return this.props.content
    }
}


export default withStyles(styles)(Content);
