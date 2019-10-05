import copy
import os
import sys
import yaml
import api
import core

from collections import MutableMapping
from core import const

log = const.log
_LOG_LEVELS_STR = ['INFO', 'WARNING', 'ERROR', 'DEBUG']

_default_conf = {
    'spotify_downloader': {
        'avconv': False,
        'download_only_metadata': False,
        'file_format': '{number}_{artist}_{track_name}',
        'folder': "/music",
        'input_ext': '.m4a',
        'log_level': 'INFO',
        'match_by_string_factor': 0.1,
        'match_by_view_factor': 0.4,
        'max_downloads': 2,
        'music_videos_only': False,
        'no_metadata': False,
        'no_spaces': True,
        'output_ext': '.mp3',
        'overwrite': 'force',
        'cache_ttl': 600,
        'search_format': '{artist} - {track_name} lyrics -live -"no voice"',
        'search_max_results': 50,
        # Generate the token. Please respect these credentials :)
        'spotify_auth': {
            'client_id': '4fe3fecfe5334023a1472516cc99d805',
            'client_secret': '0f02b7c483c04257984695007a4a8d5c'
        },
        'trim_silence': False,
        # Generate the token. Please respect these credentials :)
        'youtube_api_key': 'AIzaSyC6cEeKlxtOPybk9sEe5ksFN5sB-7wzYp0',
    }
}


def _get_config_file_name():
    return os.getenv('CONFIG_FILE_PATH', os.path.join(
        sys.path[0],
        'config.yml'))


def _merge(default, config):
    """ Override default dict with config dict. """
    merged = default.copy()
    merged.update(config)
    return merged


def _get_config(config_file):
    try:
        with open(config_file, 'r') as ymlfile:
            cfg = yaml.load(ymlfile)
    except FileNotFoundError:
        log.info('Writing default configuration to {0}:'.format(config_file))
        with open(config_file, 'w') as ymlfile:
            yaml.dump(_default_conf, ymlfile, default_flow_style=False)
            cfg = copy.deepcopy(_default_conf)

    return cfg['spotify_downloader']


class _DotDictify(dict):
    MARKER = object()

    def __init__(self, value=None):
        if value is None:
            pass
        elif isinstance(value, dict):
            for key in value:
                self.__setitem__(key, value[key])
        else:
            raise TypeError('expected dict')

    def __setitem__(self, key, value):
        if isinstance(value, dict) and not isinstance(value, _DotDictify):
            value = _DotDictify(value)
        super(_DotDictify, self).__setitem__(key, value)

    def __getitem__(self, key):
        found = self.get(key, _DotDictify.MARKER)
        if found is _DotDictify.MARKER:
            found = _DotDictify()
            super(_DotDictify, self).__setitem__(key, found)
        return found

    __setattr__, __getattr__ = __setitem__, __getitem__


def _unpack(dictionary):
    return _DotDictify(dictionary)


def _load_config():
    config = _merge(_default_conf['spotify_downloader'],
                    _get_config(_get_config_file_name()))

    return config


def _flatten(d, parent_key='', sep='.'):
    items = []
    for k, v in d.items():
        new_key = parent_key + sep + k if parent_key else k
        if isinstance(v, MutableMapping):
            items.extend(_flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def _unflatten(d, sep='.'):
    resultDict = dict()

    for key, value in d.items():
        parts = key.split(sep)
        d = resultDict
        for part in parts[:-1]:
            if part not in d:
                d[part] = dict()
            d = d[part]
        d[parts[-1]] = value

    return resultDict


def get_config_dict():
    return _flatten(_load_config())


def save_config(_conf):
    conf = _unflatten(_conf)

    final_config = {
        'spotify_downloader': conf
    }

    with open(_get_config_file_name(), 'w') as ymlfile:
        yaml.dump(final_config, ymlfile)


def init_config():
    const.config = _unpack(_load_config())

    const.log = const.logzero.setup_logger(formatter=const._formatter,
                                           level=const.config.log_level)

    api.init()
    core.init()
