from core import const
from core.const import log
from core import config
from core import metadata
from core import convert
from core import internals
from core import spotify_tools
from core import youtube_tools
from slugify import slugify
import spotipy
import urllib.request
import os
import sys
import time
import platform
import pprint

__version__ = '0.9.3'


def check_exists(folder, music_file, raw_song, meta_tags):
    """ Check if the input song already exists in the given folder. """
    log.debug('Cleaning any temp files and checking '
              'if "{}" already exists'.format(music_file))
    if not os.path.isdir(folder):
        os.mkdir(folder)

    songs = os.listdir(folder)
    for song in songs:
        if song.endswith('.temp'):
            os.remove(os.path.join(folder, song))
            continue
        # check if a song with the same name is already present in the given folder
        if os.path.splitext(song)[0] == music_file:
            log.debug('Found an already existing song: "{}"'.format(song))
            if internals.is_spotify(raw_song):
                # check if the already downloaded song has correct metadata
                # if not, remove it and download again without prompt
                already_tagged = metadata.compare(os.path.join(folder, song),
                                                  meta_tags)
                log.debug('Checking if it is already tagged correctly? {}',
                          already_tagged)
                if not already_tagged:
                    os.remove(os.path.join(folder, song))
                    return False

            log.warning('"{}" already exists'.format(song))
            if const.config.overwrite == 'force':
                os.remove(os.path.join(folder, song))
                log.info('Overwriting "{}"'.format(song))
                return False
            elif const.config.overwrite == 'skip':
                log.info('Skipping "{}"'.format(song))
                return True
    return False


def download_list(folder, songs):
    log.info(u'Preparing to download {} songs'.format(len(songs)))
    downloaded_songs = []

    for number, raw_song in enumerate(songs):
        try:
            download_single(folder, raw_song, number=number)
        # token expires after 1 hour
        except spotipy.client.SpotifyException:
            # refresh token when it expires
            log.debug('Token expired, generating new one and authorizing')
            spotify_tools.init()
            download_single(raw_song, number=number)
        # detect network problems
        except (urllib.request.URLError, TypeError, IOError):
            songs.append(raw_song)

            log.warning(
                'Failed to download song. Will retry after other songs\n', exc_info=True)

            # wait 0.5 sec to avoid infinite looping
            time.sleep(0.5)
            continue

        downloaded_songs.append(raw_song)

    return downloaded_songs


def fetch_playlist(url):
    playlist = spotify_tools.fetch_playlist(playlist=url)

    playlist_name = playlist['name']
    songs = list(map(lambda s: s['track']['external_urls']
                     ['spotify'], playlist['tracks']['items']))

    return playlist_name, songs


def fetch_playlist_info(url):
    playlist = spotify_tools.fetch_playlist(playlist=url)

    playlist_name = playlist['name']
    songs = list(map(lambda s: {
                        'name': s['track']['name'],
                        'artists': ", ".join(
                            map(lambda a: a['name'] , s['track']['artists'])
                        ),
                        'album':  s['track']['album']['name']
                    }
                    , playlist['tracks']['items']))

    info = {
        'name': playlist_name,
        'tracks': songs
    }

    return info


def download_playlist(name, songs):
    folder = os.path.join(const.config.folder, slugify(
                          name, ok=' -_()[]{}'))

    download_list(folder, songs)


def download_single(folder, raw_song, number=None):
    """ Logic behind downloading a song. """
    if internals.is_youtube(raw_song):
        log.debug('Input song is a YouTube URL')
        content = youtube_tools.go_pafy(raw_song, meta_tags=None)
        raw_song = slugify(content.title).replace('-', ' ')
        meta_tags = spotify_tools.generate_metadata(raw_song)
        meta_tags['number'] = number
    else:
        meta_tags = spotify_tools.generate_metadata(raw_song)
        meta_tags['number'] = number
        content = youtube_tools.go_pafy(raw_song, meta_tags)

    if content is None:
        log.debug('Found no matching video')
        return

    if const.config.download_only_metadata and meta_tags is None:
        log.info('Found no metadata. Skipping the download')
        return

    # "[number]. [artist] - [song]" if downloading from list
    # otherwise "[artist] - [song]"
    youtube_title = youtube_tools.get_youtube_title(content, number)
    log.info('{} ({})'.format(youtube_title, content.watchv_url))

    # generate file name of the song to download
    songname = content.title

    if meta_tags is not None:
        refined_songname = internals.format_string(const.config.file_format,
                                                   meta_tags,
                                                   slugification=True)
        log.debug('Refining songname from "{0}" to "{1}"'.format(
            songname, refined_songname))
        if not refined_songname == ' - ':
            songname = refined_songname
    else:
        log.warning('Could not find metadata')
        songname = internals.sanitize_title(songname)

    if const.config.dry_run:
        return

    if not check_exists(folder, songname, raw_song, meta_tags):
        # deal with file formats containing slashes to non-existent directories
        songpath = os.path.join(folder, os.path.dirname(songname))
        os.makedirs(songpath, exist_ok=True)
        input_song = songname + const.config.input_ext
        output_song = songname + const.config.output_ext
        if youtube_tools.download_song(songpath, input_song, content):
            print('')
            try:
                convert.song(input_song, output_song, folder,
                             avconv=const.config.avconv, trim_silence=const.config.trim_silence)
            except FileNotFoundError:
                encoder = 'avconv' if const.config.avconv else 'ffmpeg'
                log.warning(
                    'Could not find {0}, skipping conversion'.format(encoder))
                const.config.output_ext = const.config.input_ext
                output_song = songname + const.config.output_ext

            if not const.config.input_ext == const.config.output_ext:
                os.remove(os.path.join(folder, input_song))
            if not const.config.no_metadata and meta_tags is not None:
                metadata.embed(os.path.join(folder, output_song), meta_tags)
            return True
