
import copy
import os

import pytest

from core import config as cfg


class TestConfig:
    @classmethod
    @pytest.fixture(scope="function", autouse=True)
    def init_config(self, tmpdir):
        config_file = os.path.join(tmpdir.dirname, "config.yml")
        os.environ['CONFIG_FILE_PATH'] = config_file

        if os.path.isfile(config_file):
            os.remove(config_file)

        cfg.init_config()

        return config_file

    def test__get_config(self, init_config):
        expect_config = cfg._default_conf['spotify_downloader']

        config = cfg._get_config(init_config)

        assert config == expect_config

    def test__merge(self):
        modified_config = copy.deepcopy(cfg._default_conf)
        modified_config['spotify_downloader']['file_format'] = 'just_a_test'

        merged_config = cfg._merge(cfg._default_conf, modified_config)

        assert merged_config == modified_config

    def test__save_config(self, init_config):
        modified_config = copy.deepcopy(cfg._default_conf)[
            'spotify_downloader']

        modified_config['file_format'] = 'just_a_test'

        cfg.save_config(modified_config)

        config = cfg._get_config(init_config)

        assert config == modified_config

    def test__unpack(self):
        dictionary = {
            'field_1': 'value_1',
            'field_2': 'value_2',
        }

        result = cfg._unpack(dictionary)

        assert result.field_1 == 'value_1'
        assert result.field_2 == 'value_2'

    def test__flatten(self):
        dictionary = {
            'field_1': {
                'field_1_1': 'value_1'
            },
            'field_2': 'value_2',
        }

        result = cfg._flatten(dictionary)

        assert result['field_1.field_1_1'] == 'value_1'
        assert result['field_2'] == 'value_2'

    def test___unflatten(self):
        dictionary = {
            'field_1.field_1_1': 'value_1',
            'field_2': 'value_2',
        }

        expected = {
            'field_1': {
                'field_1_1': 'value_1'
            },
            'field_2': 'value_2',
        }

        result = cfg._unflatten(dictionary)

        assert expected == result

    def test_get_config_dict(self, init_config):
        expect_config = cfg._get_config(init_config)

        result = cfg.get_config_dict()

        assert result == cfg._flatten(expect_config)
