import pprint
import re
import time
from enum import Enum

import lyricwikia
import spotipy
import spotipy.oauth2 as oauth2
from titlecase import titlecase

from core import const, internals
from core.const import log

_token_expiration_time = None
_spotify = None


def _getClient():
    global _token_expiration_time
    global _spotify

    if not _spotify or _token_expiration_time > time.time():
        credentials = oauth2.SpotifyClientCredentials(
            client_id=const.config.spotify_auth.client_id,
            client_secret=const.config.spotify_auth.client_secret)

        token = credentials.get_access_token()

        _token_expiration_time = credentials.token_info['expires_at']

        spotify = spotipy.Spotify(auth=token)

    return spotify


def init():
    pass


def generate_metadata(raw_song):
    """ Fetch a song's metadata from Spotify. """
    if internals.is_spotify(raw_song):
        # fetch track information directly if it is spotify link
        log.debug('Fetching metadata for given track URL')
        meta_tags = _getClient().track(raw_song)
    else:
        # otherwise search on spotify and fetch information from first result
        log.debug('Searching for "{}" on Spotify'.format(raw_song))
        try:
            search_result = _getClient().search(raw_song, limit=1)
            meta_tags = search_result[
                'tracks']['items'][0]
        except IndexError:
            return None
    artist = _getClient().artist(meta_tags['artists'][0]['id'])
    album = _getClient().album(meta_tags['album']['id'])

    try:
        meta_tags[u'genre'] = titlecase(artist['genres'][0])
    except IndexError:
        meta_tags[u'genre'] = None
    try:
        meta_tags[u'copyright'] = album['copyrights'][0]['text']
    except IndexError:
        meta_tags[u'copyright'] = None
    try:
        meta_tags[u'external_ids'][u'isrc']
    except KeyError:
        meta_tags[u'external_ids'][u'isrc'] = None

    meta_tags[u'release_date'] = album['release_date']
    meta_tags[u'publisher'] = album['label']
    meta_tags[u'total_tracks'] = album['tracks']['total']

    log.debug('Fetching lyrics')

    try:
        meta_tags['lyrics'] = lyricwikia.get_lyrics(
            meta_tags['artists'][0]['name'],
            meta_tags['name'])
    except lyricwikia.LyricsNotFound:
        meta_tags['lyrics'] = None

    # Some sugar
    meta_tags['year'], *_ = meta_tags['release_date'].split('-')
    meta_tags['duration'] = meta_tags['duration_ms'] / 1000.0
    # Remove unwanted parameters
    del meta_tags['duration_ms']
    del meta_tags['available_markets']
    del meta_tags['album']['available_markets']

    log.debug(pprint.pformat(meta_tags))
    return meta_tags


_ALBUM_RE = re.compile("https://open.spotify.com/album/.+")
_PLAYLIST_RE = re.compile("https://open.spotify.com/(user|playlist)/.+")
_TRACK_RE = re.compile("https://open.spotify.com/track/.+")


def fetch(url):
    if _ALBUM_RE.match(url):
        return _fetch_album(url), 'ALBUM'
    elif _PLAYLIST_RE.match(url):
        return _fetch_playlist(url), 'PLAYLIST'
    elif _TRACK_RE.match(url):
        return _fetch_track(url), 'TRACK'
    else:
        return None, 'NONE'


def _fetch_playlist(playlist):
    splits = internals.get_splits(playlist)
    try:
        username = splits[-3]
    except IndexError:
        # Wrong format, in either case
        log.error('The provided playlist URL is not in a recognized format!')
        return None
    playlist_id = splits[-1]
    try:
        results = _getClient().user_playlist(
                    username, playlist_id,
                    fields='tracks,next,name,images,artists,description')
    except spotipy.client.SpotifyException:
        log.error('Unable to find playlist', exc_info=True)
        log.info('Make sure the playlist is set to ' +
                 'publicly visible and then try again')
        return None

    return results


def _fetch_album(album):
    splits = internals.get_splits(album)
    album_id = splits[-1]
    album = _getClient().album(album_id)
    return album


def _fetch_track(track):
    splits = internals.get_splits(track)
    track_id = splits[-1]
    track = _getClient().track(track_id)

    data = {
        'name': track['name'],
        'artists': track['artists'],
        'album': track['album']['name'],
        'tracks': {
            'items': [
                track
            ]
        }
    }
    return data


_MAX_RESULTS_SEARCH_REQUEST = 10


class _SEARCH_TYPE(Enum):
    ALBUM = "album"
    ARTIST = "artist"
    PLAYLIST = "playlist"
    TRACK = "track"


def search(query, max_results=10, _type=_SEARCH_TYPE.TRACK):
    try:
        current_offset = 0

        results = {}
        stop = False

        limit = _MAX_RESULTS_SEARCH_REQUEST
        if limit > max_results:
            limit = max_results

        while not stop:
            response = _getClient().search(query,
                                           limit=limit,
                                           offset=current_offset,
                                           type=_type.value)

            items_key = '{0}s'.format(_type.value)

            if len(response[items_key]['items']) > 0:
                current_offset = current_offset + \
                    len(response[items_key]['items'])

                for i in response[items_key]['items']:
                    results[i['id']] = i

            if not response[items_key]['next'] \
               or len(results) >= max_results:
                stop = True
    except spotipy.client.SpotifyException:
        log.error('Unable to search', exc_info=True)

        return None

    return list(results.values())
