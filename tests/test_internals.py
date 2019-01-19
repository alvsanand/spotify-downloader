from core import internals

from core import config as cfg

import sys
import os
import subprocess
import pytest


class TestUtilities:
    @classmethod
    @pytest.fixture(scope="function", autouse=True)
    def init_config(self, tmpdir):
        config_file = os.path.join(tmpdir.dirname, "config.yml")
        os.environ['CONFIG_FILE_PATH'] = config_file

        if os.path.isfile(config_file):
            os.remove(config_file)

        cfg.init_config()

        return config_file

    def test_is_spotify(self):
        url = "https://open.spotify.com/user/spotify/playlist/37i9dQZF1DX6PYajiT4pAf?si=PxCM89KITte-N40hxgykqw"
        result = internals.is_spotify(url)
        assert result

        url = "https://open.notspotify.com/user/spotify/playlist/37i9dQZF1DX6PYajiT4pAf?si=PxCM89KITte-N40hxgykqw"
        result = internals.is_spotify(url)
        assert not result

    def test_is_youtube(self):
        url = "https://www.youtube.com/watch?v=aaaaa"
        result = internals.is_youtube(url)
        assert result

        url = "https://www.notyoutube.com/watch?v="
        result = internals.is_youtube(url)
        assert not result

    def test_sanitize(self, init_config):
        txt = '影師嗎'
        result = internals.sanitize(txt)
        assert result == 'Ying Shi Ma '


class TestFormatString:
    tags = {
        'name': 'my_name',
        'artists': [{'name': 'my_artists'}],
        'album': {'name': 'my_album'},
        'genre': 'my_genre',
        'disc_number': 'my_disc_number',
        'duration': 'my_duration',
        'year': 'my_year',
        'release_date': 'my_release_date',
        'track_number': 'my_track_number',
        'total_tracks': 'my_total_tracks',
        'external_ids': {'isrc': 'my_isrc'},
        'number': 'my_number',
    }
    some_tags = {
        'name': 'my_name',
        'album': {'name': 'my_album'},
    }

    def test_simple(self):
        string_format = "{track_name}"
        expected = 'my_name'

        result = internals.format_string(string_format, TestFormatString.tags)
        assert result == expected

    def test_some_tags(self):
        string_format = "{track_name}-{disc_number}-{album}"
        expected = 'my_name--my_album'

        result = internals.format_string(
            string_format, TestFormatString.some_tags)
        assert result == expected

    def test_duplicate(self):
        string_format = "{track_name}-{track_name}"
        expected = 'my_name-my_name'

        result = internals.format_string(string_format, TestFormatString.tags)
        assert result == expected

    def test_all(self):
        string_format = '_{track_name}' + \
                        '_{artist}' + \
                        '_{album}' + \
                        '_{album_artist}' + \
                        '_{genre}' + \
                        '_{disc_number}' + \
                        '_{duration}' + \
                        '_{year}' + \
                        '_{original_date}' + \
                        '_{track_number}' + \
                        '_{total_tracks}' + \
                        '_{isrc}' + \
                        '_{number}'
        expected = '_my_name' + \
                   '_my_artists' + \
                   '_my_album' + \
                   '_my_artists' + \
                   '_my_genre' + \
                   '_my_disc_number' + \
                   '_my_duration' + \
                   '_my_year' + \
                   '_my_release_date' + \
                   '_my_track_number' + \
                   '_my_total_tracks' + \
                   '_my_isrc' + \
                   '_my_number'

        result = internals.format_string(string_format, TestFormatString.tags)
        assert result == expected

    def test_all_duplicate(self):
        string_format = '_{track_name}' + \
                        '_{artist}' + \
                        '_{album}' + \
                        '_{album_artist}' + \
                        '_{genre}' + \
                        '_{disc_number}' + \
                        '_{duration}' + \
                        '_{year}' + \
                        '_{original_date}' + \
                        '_{track_number}' + \
                        '_{total_tracks}' + \
                        '_{isrc}' + \
                        '_{number}'
        expected = '_my_name' + \
                   '_my_artists' + \
                   '_my_album' + \
                   '_my_artists' + \
                   '_my_genre' + \
                   '_my_disc_number' + \
                   '_my_duration' + \
                   '_my_year' + \
                   '_my_release_date' + \
                   '_my_track_number' + \
                   '_my_total_tracks' + \
                   '_my_isrc' + \
                   '_my_number'

        result = internals.format_string(
            string_format*2, TestFormatString.tags)
        assert result == expected*2


class TestPathFilterer:
    def test_create_directory(self, tmpdir):
        expect_path = True
        global folder_path
        folder_path = os.path.join(str(tmpdir), 'filter_this_folder')
        internals.filter_path(folder_path)
        is_path = os.path.isdir(folder_path)
        assert is_path == expect_path

    def test_remove_temp_files(self, tmpdir):
        expect_file = False
        file_path = os.path.join(folder_path, 'pesky_file.temp')
        open(file_path, 'a')
        internals.filter_path(folder_path)
        is_file = os.path.isfile(file_path)
        assert is_file == expect_file


class TestVideoTimeFromSeconds:
    def test_from_seconds(self):
        expect_duration = '35'
        duration = internals.videotime_from_seconds(35)
        assert duration == expect_duration

    def test_from_minutes(self):
        expect_duration = '2:38'
        duration = internals.videotime_from_seconds(158)
        assert duration == expect_duration

    def test_from_hours(self):
        expect_duration = '1:16:02'
        duration = internals.videotime_from_seconds(4562)
        assert duration == expect_duration


class TestGetSeconds:
    def test_from_seconds(self):
        expect_secs = 45
        secs = internals.get_sec('0:45')
        assert secs == expect_secs
        secs = internals.get_sec('0.45')
        assert secs == expect_secs

    def test_from_minutes(self):
        expect_secs = 213
        secs = internals.get_sec('3.33')
        assert secs == expect_secs
        secs = internals.get_sec('3:33')
        assert secs == expect_secs

    def test_from_hours(self):
        expect_secs = 5405
        secs = internals.get_sec('1.30.05')
        assert secs == expect_secs
        secs = internals.get_sec('1:30:05')
        assert secs == expect_secs

    def test_raise_error(self):
        with pytest.raises(ValueError):
            internals.get_sec('10*05')
        with pytest.raises(ValueError):
            internals.get_sec('02,28,46')
