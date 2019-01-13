# Spotify-Downloader

- Downloads songs from YouTube in an MP3 format by using Spotify's HTTP link.
- Can also download a song by entering its artist and song name (in case if you don't have the Spotify's HTTP link for some song).
- Automatically applies metadata to the downloaded song which include:

  - Title
  - Artist
  - Album
  - Album art
  - Lyrics (if found on http://lyrics.wikia.com)
  - Album artist
  - Genre
  - Track number
  - Disc number
  - Release date
  - And more...

- Works straight out of the box and does not require to generate or mess with your API keys (already included).

That's how your music library will look like!

<img src="http://i.imgur.com/Gpch7JI.png" width="290"><img src="http://i.imgur.com/5vhk3HY.png" width="290"><img src="http://i.imgur.com/RDTCCST.png" width="290">

## Installation

```
docker build -t alvsanand/spotify-downloader .
```

## Development

Un order to run in development mode:

- Start Flask server:

    ```
    python3 -m venv env

    source env/bin/activate

    pip install -r requirements.txt

    source env/bin/activate

    export LOCAL_MODE=True

    python app.py
    ```
- Start react server:

    ```
    cd react-ui
    npm install
    npm run start
    ```

## Usage

- Run docker container:

    ```
    MUSIC_FOLDER={YOUR_MUSIC_DIRECTORY}
    docker run --name spotify-downloader -p 5000:5000 -u `stat -c "%u:%g" $MUSIC_FOLDER` -d -v $MUSIC_FOLDER:/music alvsanand/spotify-downloader
    ```
- For accessing the UI, go to [http://localhost:5000](http://localhost:5000).
- In order to see the logs:

    ```
    docker logs $(docker ps -aq --filter name=spotify-downloader)
    ```

## Running Tests

```
python3 -m pytest test
```

Obviously this requires the `pytest` module to be installed.

## Disclaimer

Downloading copyright songs may be illegal in your country.
This tool is for educational purposes only and was created only to show
how Spotify's API can be exploited to download music from YouTube.
Please support the artists by buying their music.
