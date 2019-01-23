import os
import re

from slugify import slugify

from core import const

formats = {0: 'track_name',
           1: 'artist',
           2: 'album',
           3: 'album_artist',
           4: 'genre',
           5: 'disc_number',
           6: 'duration',
           7: 'year',
           8: 'original_date',
           9: 'track_number',
           10: 'total_tracks',
           11: 'isrc',
           12: 'number'}

_SPOTIFY_RE = re.compile("https://open.spotify.com/.+")
_YOUTUBE_RE = re.compile("https://www.youtube.com/watch\\?v=.+")


def is_spotify(url):
    return _SPOTIFY_RE.match(url)


def is_youtube(url):
    return _YOUTUBE_RE.match(url)


def format_string(
        string_format, tags, slugification=False, force_spaces=False):
    # Generate a string of the format '[artist] - [song]'
    # for the given spotify song.
    format_tags = dict(formats)
    format_tags[0] = tags.get('name', '')
    format_tags[1] = tags.get('artists', [{'name': ''}])[0]['name']
    format_tags[2] = tags.get('album', {'name': ''})['name']
    format_tags[3] = tags.get('artists', [{'name': ''}])[0]['name']
    format_tags[4] = tags.get('genre', '')
    format_tags[5] = tags.get('disc_number', '')
    format_tags[6] = tags.get('duration', '')
    format_tags[7] = tags.get('year', '')
    format_tags[8] = tags.get('release_date', '')
    format_tags[9] = tags.get('track_number', '')
    format_tags[10] = tags.get('total_tracks', '')
    format_tags[11] = tags.get('external_ids', {'isrc': ''})['isrc']
    format_tags[12] = tags.get('number', '')

    for tag in format_tags:
        if slugification:
            format_tags[tag] = sanitize(format_tags[tag],
                                        ok='-_()[]{}')
        else:
            format_tags[tag] = str(format_tags[tag])

    for x in formats:
        format_tag = '{' + formats[x] + '}'
        string_format = string_format.replace(format_tag,
                                              format_tags[x])

    if const.config.no_spaces and not force_spaces:
        string_format = string_format.replace(' ', '_')

    return string_format


def sanitize(title, ok='-_()[]{}\\/'):
    """ Generate filename of the song to be downloaded. """

    if const.config.no_spaces:
        title = title.replace(' ', '_')

    # slugify removes any special characters
    title = slugify(title, ok=ok, only_ascii=True, lower=False, spaces=True)
    return title


def filter_path(path):
    if not os.path.exists(path):
        os.makedirs(path)
    for temp in os.listdir(path):
        if temp.endswith('.temp'):
            os.remove(os.path.join(path, temp))


def videotime_from_seconds(time):
    if time < 60:
        return str(time)
    if time < 3600:
        return '{0}:{1:02}'.format(time//60, time % 60)

    return '{0}:{1:02}:{2:02}'.format(
        (time // 60) // 60, (time // 60) % 60, time % 60)


def get_sec(time_str):
    if ':' in time_str:
        splitter = ':'
    elif '.' in time_str:
        splitter = '.'
    else:
        raise ValueError("No expected character found in {} to split"
                         "time values.".format(time_str))
    v = time_str.split(splitter, 3)
    v.reverse()
    sec = 0
    if len(v) > 0:  # seconds
        sec += int(v[0])
    if len(v) > 1:  # minutes
        sec += int(v[1]) * 60
    if len(v) > 2:  # hours
        sec += int(v[2]) * 3600
    return sec


def get_splits(url):
    if '/' in url:
        if url.endswith('/'):
            url = url[:-1]
        splits = url.split('/')
    else:
        splits = url.split(':')
    return splits
