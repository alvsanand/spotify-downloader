import api
import core
from core import const
from collections import MutableMapping, namedtuple

log = const.log

import logging
import yaml
import argparse

import os
import sys


_LOG_LEVELS_STR = ['INFO', 'WARNING', 'ERROR', 'DEBUG']

_default_conf = {
                'spotify_downloader': {
                        'avconv'                 : False,
                        'download_only_metadata' : False,
                        'file_format'            : '{number}_{artist}_{track_name}',
                        'folder'                 : "/music",
                        'input_ext'              : '.m4a',
                        'log_level'              : 'INFO',
                        'match_by_string'        : True,
                        'max_downloads'          : 2,
                        'music_videos_only'      : False,
                        'no_metadata'            : False,
                        'no_spaces'              : False,
                        'output_ext'             : '.mp3',
                        'overwrite'              : 'prompt',
                        'search_format'          : '{artist} - {track_name} song',
                        'search_max_results'     : 9,
                        # Generate the token. Please respect these credentials :)
                        'spotify_auth'           : {
                            'client_id'             : '4fe3fecfe5334023a1472516cc99d805',
                            'client_secret'         : '0f02b7c483c04257984695007a4a8d5c'
                        },
                        'trim_silence'           : False,
                        # Generate the token. Please respect these credentials :)
                        'youtube_api_key'        : 'AIzaSyC6cEeKlxtOPybk9sEe5ksFN5sB-7wzYp0',
                }
            }


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
            cfg = _default_conf

        for line in yaml.dump(_default_conf['spotify_downloader'], default_flow_style=False).split('\n'):
            if line.strip():
                log.info(line.strip())

    return cfg['spotify_downloader']


def _isnamedtupleinstance(x):
    _type = type(x)
    bases = _type.__bases__
    if len(bases) != 1 or bases[0] != tuple:
        return False
    fields = getattr(_type, '_fields', None)
    if not isinstance(fields, tuple):
        return False
    return all(type(i)==str for i in fields)

def _unpack(dictionary):
    for key, value in dictionary.items():
            if isinstance(value, dict):
                dictionary[key] = _unpack(value)
    return namedtuple('GenericDict', dictionary.keys())(**dictionary)

def _load_config():
    config_file = os.path.join(sys.path[0], 'config.yml')
    config = _merge(_default_conf['spotify_downloader'], _get_config(config_file))

    config['folder'] = os.path.relpath(config['folder'], os.getcwd())

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

    config_file = os.path.join(sys.path[0], 'config.yml')

    final_config = {
        'spotify_downloader': conf
    }

    with open(config_file, 'w') as ymlfile:
        cfg = yaml.dump(final_config, ymlfile)

    init_config()


def init_config():
    const.config = _unpack(_load_config())

    const.log = const.logzero.setup_logger(formatter=const._formatter,
                                           level=const.config.log_level)

    api.init()
    core.init()