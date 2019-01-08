from core import internals, const
from collections import namedtuple

log = const.log

import logging
import yaml
import argparse

import os
import sys


_LOG_LEVELS_STR = ['INFO', 'WARNING', 'ERROR', 'DEBUG']

default_conf = { 'spotify-downloader':
                 { 'manual'                 : False,
                   'no-metadata'            : False,
                   'avconv'                 : False,
                   'folder'                 : internals.get_music_dir(),
                   'overwrite'              : 'prompt',
                   'input-ext'              : '.m4a',
                   'output-ext'             : '.mp3',
                   'trim-silence'           : False,
                   'download-only-metadata' : False,
                   'dry-run'                : False,
                   'music-videos-only'      : False,
                   'no-spaces'              : False,
                   'file-format'            : '{number}_{artist}_{track_name}',
                   'search-format'          : '{artist} - {track_name} lyrics',
                   'youtube-api-key'        : None,
                   'log-level'              : 'INFO',
                   'direct_download'        : False }
               }


def merge(default, config):
    """ Override default dict with config dict. """
    merged = default.copy()
    merged.update(config)
    return merged


def get_config(config_file):
    try:
        with open(config_file, 'r') as ymlfile:
            cfg = yaml.load(ymlfile)
    except FileNotFoundError:
        log.info('Writing default configuration to {0}:'.format(config_file))
        with open(config_file, 'w') as ymlfile:
            yaml.dump(default_conf, ymlfile, default_flow_style=False)
            cfg = default_conf

        for line in yaml.dump(default_conf['spotify-downloader'], default_flow_style=False).split('\n'):
            if line.strip():
                log.info(line.strip())
        log.info('Please note that command line arguments have higher priority '
                 'than their equivalents in the configuration file')

    return cfg['spotify-downloader']


def load_config():
    config_file = os.path.join(sys.path[0], 'config.yml')
    config = merge(default_conf['spotify-downloader'], get_config(config_file))
        
    config['folder'] = os.path.relpath(config['folder'], os.getcwd())
    config['direct_download'] = True

    return namedtuple("Employee", map(lambda k: k.replace("-", "_"), config.keys()))(*config.values())
