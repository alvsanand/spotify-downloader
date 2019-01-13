import spotipy
import spotipy.oauth2 as oauth2
import lyricwikia
import os

from core import const
from core import internals
from core.const import log

from slugify import slugify
from titlecase import titlecase
import pprint
import sys

import shutil


token = None
spotify = None


def init():
    global token, spotify

    token = _generate_token()
    spotify = spotipy.Spotify(auth=token)

def _generate_token():
    credentials = oauth2.SpotifyClientCredentials(
        client_id=const.config.spotify_auth.client_id,
        client_secret=const.config.spotify_auth.client_secret)

    token = credentials.get_access_token()

    return token


def generate_metadata(raw_song):
    """ Fetch a song's metadata from Spotify. """
    if internals.is_spotify(raw_song):
        # fetch track information directly if it is spotify link
        log.debug('Fetching metadata for given track URL')
        meta_tags = spotify.track(raw_song)
    else:
        # otherwise search on spotify and fetch information from first result
        log.debug('Searching for "{}" on Spotify'.format(raw_song))
        try:
            meta_tags = spotify.search(raw_song, limit=1)['tracks']['items'][0]
        except IndexError:
            return None
    artist = spotify.artist(meta_tags['artists'][0]['id'])
    album = spotify.album(meta_tags['album']['id'])

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


def get_playlists(username):
    """ Fetch user playlists when using the -u option. """
    playlists = spotify.user_playlists(username)
    links = []
    check = 1

    while True:
        for playlist in playlists['items']:
            # in rare cases, playlists may not be found, so playlists['next']
            # is None. Skip these. Also see Issue #91.
            if playlist['name'] is not None:
                log.info(u'{0:>5}. {1:<30}  ({2} tracks)'.format(
                    check, playlist['name'],
                    playlist['tracks']['total']))
                playlist_url = playlist['external_urls']['spotify']
                log.debug(playlist_url)
                links.append(playlist_url)
                check += 1
        if playlists['next']:
            playlists = spotify.next(playlists)
        else:
            break

    return links


def fetch_playlist(playlist):
    splits = internals.get_splits(playlist)
    try:
        username = splits[-3]
    except IndexError:
        # Wrong format, in either case
        log.error('The provided playlist URL is not in a recognized format!')
        sys.exit(10)
    playlist_id = splits[-1]
    try:
        results = spotify.user_playlist(username, playlist_id,
                                        fields='tracks,next,name')
    except spotipy.client.SpotifyException:
        log.error('Unable to find playlist')
        log.info('Make sure the playlist is set to publicly visible and then try again')
        sys.exit(11)

    return results


def fetch_album(album):
    splits = internals.get_splits(album)
    album_id = splits[-1]
    album = spotify.album(album_id)
    return album
