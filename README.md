# Spotify-Downloader

[![Build Status](https://travis-ci.com/alvsanand/spotify-downloader.svg?branch=master)](https://travis-ci.com/alvsanand/spotify-downloader)
[![Docker Build Status](https://img.shields.io/docker/build/alvsanand/spotify-downloader.svg)](https://cloud.docker.com/u/alvsanand/repository/docker/alvsanand/spotify-downloader)

This is a more user friendly version of the fantastic [Spotify Downloader](https://github.com/ritiek/spotify-downloader) of [ritiek](https://github.com/ritiek).

This is a list of some of its features:

- Downloads songs from YouTube in an MP3 format by using Spotify metadata.
- Functional UI based on ReactJS and MATERIAL-UI.
- Search for songs, albums and playlist or simply copy the Spotify's HTTP link.
- Pre-visualize the songs before downloading them in YouTube.
- Fetch info from Spotify and play the songs using its web player.
- Automatically applies metadata to the downloaded song
- Works straight out of the box and does not require to generate or mess with your API keys (already included).

That's how it will look like!

![snapshot_1](https://github.com/alvsanand/spotify-downloader/raw/master/snapshot_1.png)
![snapshot_2](https://github.com/alvsanand/spotify-downloader/raw/master/snapshot_2.png)
![snapshot_3](https://github.com/alvsanand/spotify-downloader/raw/master/snapshot_3.png)

## Usage

- Run docker container:

  - Unix:

    ``` bash
    MUSIC_FOLDER={YOUR_MUSIC_DIRECTORY}
    docker run --restart=always --name spotify-downloader -p 5000:5000 -u `stat -c "%u:%g" $MUSIC_FOLDER` -d -v $MUSIC_FOLDER:/music alvsanand/spotify-downloader
    ```

  - Windows:

    ``` bash
    % First, you must have configured shared folders in Docker Desktop

    set MUSIC_FOLDER={YOUR_MUSIC_DIRECTORY}
    docker run --restart=always --name spotify-downloader -p 5000:5000 -d -v %MUSIC_FOLDER%:/music alvsanand/spotify-downloader
    ```

- For accessing the UI, go to [http://localhost:5000](http://localhost:5000).
- In order to see the logs:

    ``` bash
    docker logs $(docker ps -aq --filter name=spotify-downloader)
    ```

- Sometimes "youtube_dl" python library is outdated and downloads do not work. So just, we must remove the current execution and launch it again.

    ``` bash
    docker rm -f $(docker ps -aq --filter name=spotify-downloader)

    ## See "Run docker container"
    ```

## Development

Un order to run in development mode:

- Start Flask server:

    ``` bash
    sudo apt-get install build-essential python3-venv python3-dev

    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt

    export LOCAL_MODE=True

    python app.py
    ```

- Start react server:

    ``` bash
    cd react-ui
    npm install
    npm run start
    ```

## Running Tests

``` bash
python3 -m venv venv
source venv/bin/activate

pip install pytest pytest-cov

python3 -m pytest tests
```

## Disclaimer

Downloading copyright songs may be illegal in your country.
This tool is for educational purposes only and was created only to show
how Spotify's API can be exploited to download music from YouTube.
Please support the artists by buying their music.
