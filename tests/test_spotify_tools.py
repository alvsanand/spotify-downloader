from core import spotify_tools
from core import config as cfg
from unittest.mock import patch, Mock, MagicMock
import pytest
import time
import os
from core import const


class TestClient:
    @classmethod
    @pytest.fixture(scope="function", autouse=True)
    def init_config(self, tmpdir):
        config_file = os.path.join(tmpdir.dirname, "config.yml")
        os.environ['CONFIG_FILE_PATH'] = config_file

        if os.path.isfile(config_file):
            os.remove(config_file)

        cfg.init_config()

        return config_file

    def test__getClient(self, init_config):
        expiration_time = time.time() + 1000
        credentials = Mock()
        access_token = Mock()

        credentials.get_access_token = MagicMock(return_value=access_token)
        credentials.token_info = {
            'expires_at': expiration_time
        }

        with patch('spotipy.oauth2.SpotifyClientCredentials') as _credentials, \
                patch('spotipy.Spotify', return_value=access_token) as _spotify:
            _credentials.return_value = credentials
            _spotify.return_value = "spotipy.Spotify"

            result = spotify_tools._getClient()

            _credentials.assert_called_once_with(
                client_id=const.config.spotify_auth.client_id,
                client_secret=const.config.spotify_auth.client_secret
            )
            credentials.get_access_token.assert_called_once_with()
            _spotify.assert_called_once_with(auth=access_token)

            assert result == _spotify.return_value
            assert spotify_tools._token_expiration_time == expiration_time

    def test__getClient_reload_token(self, init_config):
        expiration_time = time.time() + 0.1
        credentials = Mock()
        access_token = Mock()

        credentials.get_access_token = MagicMock(return_value=access_token)
        credentials.token_info = {
            'expires_at': expiration_time
        }

        with patch('spotipy.oauth2.SpotifyClientCredentials') as _credentials, \
                patch('spotipy.Spotify', return_value=access_token) as _spotify:
            _credentials.return_value = credentials
            _spotify.return_value = "spotipy.Spotify"

            result = spotify_tools._getClient()

            _credentials.assert_called_with(
                client_id=const.config.spotify_auth.client_id,
                client_secret=const.config.spotify_auth.client_secret
            )
            credentials.get_access_token.assert_called_with()
            _spotify.assert_called_with(auth=access_token)

            assert result == _spotify.return_value
            assert spotify_tools._token_expiration_time == expiration_time

            time.sleep(0.2)

            expiration_time = time.time() + 0.1
            credentials.token_info = {
                'expires_at': expiration_time
            }

            result = spotify_tools._getClient()

            _credentials.assert_called_with(
                client_id=const.config.spotify_auth.client_id,
                client_secret=const.config.spotify_auth.client_secret
            )
            credentials.get_access_token.assert_called_with()
            _spotify.assert_called_with(auth=access_token)

            assert result == _spotify.return_value
            assert spotify_tools._token_expiration_time == expiration_time


class TestFetch:
    def test__fetch_album(self):
        with patch('core.spotify_tools._fetch_playlist',
                   new=(lambda u: '_fetch_playlist')), \
            patch('core.spotify_tools._fetch_album',
                  new=(lambda u: '_fetch_album')), \
            patch('core.spotify_tools._fetch_track',
                  new=(lambda u: '_fetch_track')):

            data = [
                [
                    "https://open.spotify.com/album/1",
                    ("_fetch_album", 'ALBUM')
                ],
                [
                    "https://open.spotify.com/album/2",
                    ("_fetch_album", 'ALBUM')
                ]
            ]

            for d in data:
                assert spotify_tools.fetch(d[0]) == d[1]

    def test__fetch_playlist(self):
        with patch('core.spotify_tools._fetch_playlist',
                   new=(lambda u: '_fetch_playlist')), \
            patch('core.spotify_tools._fetch_album',
                  new=(lambda u: '_fetch_album')), \
            patch('core.spotify_tools._fetch_track',
                  new=(lambda u: '_fetch_track')):

            data = [
                [
                    "https://open.spotify.com/playlist/1",
                    ("_fetch_playlist", 'PLAYLIST')
                ],
                [
                    "https://open.spotify.com/user/2",
                    ("_fetch_playlist", 'PLAYLIST')
                ]
            ]

            for d in data:
                assert spotify_tools.fetch(d[0]) == d[1]

    def test__fetch_track(self):
        with patch('core.spotify_tools._fetch_playlist',
                   new=(lambda u: '_fetch_playlist')), \
            patch('core.spotify_tools._fetch_album',
                  new=(lambda u: '_fetch_album')), \
            patch('core.spotify_tools._fetch_track',
                  new=(lambda u: '_fetch_track')):

            data = [
                [
                    "https://open.spotify.com/track/1",
                    ("_fetch_track", 'TRACK')
                ],
                [
                    "https://open.spotify.com/track/2",
                    ("_fetch_track", 'TRACK')
                ]
            ]

            for d in data:
                assert spotify_tools.fetch(d[0]) == d[1]


@pytest.mark.skip
class MockSpotifyClient:
    def __init__(self, return_value=None, param_1=None, param_2=None):
        self.return_value = return_value
        self.param_1 = param_1
        self.param_2 = param_2

    def album(self, album_id):
        if self.param_1 != album_id:
            raise Exception("album_id incorrect")

        return self.return_value

    def track(self, track_id):
        if self.param_1 != track_id:
            raise Exception("track_id incorrect")

        return self.return_value

    def user_playlist(self, username, playlist_id, fields):
        if self.param_1 != username:
            raise Exception("username incorrect")
        if self.param_2 != playlist_id:
            raise Exception("playlist_id incorrect")

        return self.return_value


class TestFetchMethods:
    def test__fetch_album(self):
        url = "https://open.spotify.com/album/album_id"
        expected_param1 = 'album_id'
        expected_result = 'my_album_id'

        mock = MockSpotifyClient(expected_result, expected_param1)

        with patch('core.spotify_tools._getClient',
                   new=(lambda: mock)):
            result = spotify_tools._fetch_album(url)

            assert result == expected_result

    def test__fetch_playlist_1(self):
        url = "https://open.spotify.com/user/txcwkvj8v3kcfyrep95xbsara/playlist/15C6EYuvuFdpnA5ViyGIBr"
        expected_param1 = 'txcwkvj8v3kcfyrep95xbsara'
        expected_param2 = '15C6EYuvuFdpnA5ViyGIBr'
        expected_result = 'my_playlist_id'

        mock = MockSpotifyClient(
            expected_result, expected_param1, expected_param2)

        with patch('core.spotify_tools._getClient',
                   new=(lambda: mock)):
            result = spotify_tools._fetch_playlist(url)

            assert result == expected_result

    def test__fetch_track(self):
        url = "https://open.spotify.com/track/track_id"
        expected_param1 = 'track_id'
        result = {
            'name': 'my_name',
            'artists': 'my_artists',
            'album': {'name': 'my_album'},
        }
        expected_result = {
            'name': result['name'],
            'artists': result['artists'],
            'album': result['album']['name'],
            'tracks': {
                'items': [
                    result
                ]
            }
        }

        mock = MockSpotifyClient(result, expected_param1)

        with patch('core.spotify_tools._getClient',
                   new=(lambda: mock)):
            result = spotify_tools._fetch_track(url)

            assert result == expected_result


class TestMetadata:
    def test_metadata(self):
        raw_song = 'https://open.spotify.com/track/0JlS7BXXD07hRmevDnbPDU'
        
        expect_number = 23
        global meta_tags
        meta_tags = spotify_tools.generate_metadata(raw_song)
        assert len(meta_tags) == expect_number

