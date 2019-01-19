
from core import const
from core import config
from core import spotdl
from core import internals
from core import spotify_tools
from core import youtube_tools
from core import convert
from core import metadata

import os


config.init_config()
raw_song = 'https://open.spotify.com/track/33IOhptvC2Qoy2UhjiHXLV'
meta_tags = spotify_tools.generate_metadata(raw_song)

file_format = '{artist} - {track_name}'


class TestFileFormat:
    def test_with_spaces(self):
        expect_title = 'David Guetta - Flames'
        title = internals.format_string(file_format, meta_tags)
        assert title == expect_title

    def test_without_spaces(self):
        expect_title = 'David_Guetta_-_Flames'
        const.config.no_spaces = True
        title = internals.format_string(file_format, meta_tags)
        assert title == expect_title


def test_youtube_url_disabled_match_by_string():
    expect_url = 'https://youtube.com/watch?v=J75enyWdbBM'
    const.config.match_by_string = False
    url = youtube_tools.generate_youtube_url(raw_song, meta_tags)
    assert url == expect_url


def test_youtube_title():
    expect_title = 'David Guetta & Sia - Flames (Official Video)'
    global content
    content = youtube_tools.go_pafy(raw_song, meta_tags)
    title = youtube_tools.get_youtube_title(content)
    assert title == expect_title


def test_check_track_exists_before_download(tmpdir):
    expect_check = False
    global tmp_dir
    tmp_dir = tmpdir
    const.config.folder = str(tmp_dir)

    # prerequisites for determining filename
    songname = internals.format_string(file_format, meta_tags)
    global file_name
    file_name = internals.sanitize(songname)
    check = spotdl._check_exists(tmp_dir, file_name, raw_song, meta_tags)
    assert check == expect_check


class TestDownload:
    def test_m4a(self):
        expect_download = True
        download = youtube_tools.download_song(
            tmp_dir, file_name + '.m4a', content)
        assert download == expect_download

    def test_webm(self):
        expect_download = True
        download = youtube_tools.download_song(
            tmp_dir, file_name + '.webm', content)
        assert download == expect_download


class TestFFmpeg():
    def test_convert_from_webm_to_mp3(self):
        global _file_name
        _file_name = os.path.join(tmp_dir, file_name)

        expect_return_code = 0
        return_code = convert.song(_file_name + '.webm',
                                   _file_name + '.mp3',
                                   const.config.folder)
        assert return_code == expect_return_code

    def test_convert_from_m4a_to_mp3(self):
        expect_return_code = 0
        return_code = convert.song(_file_name + '.m4a',
                                   _file_name + '.mp3',
                                   const.config.folder)
        assert return_code == expect_return_code

    def test_convert_from_m4a_to_webm(self):
        expect_return_code = 0
        return_code = convert.song(_file_name + '.m4a',
                                   _file_name + '.webm',
                                   const.config.folder)
        assert return_code == expect_return_code

    def test_convert_from_m4a_to_flac(self):
        expect_return_code = 0
        return_code = convert.song(_file_name + '.m4a',
                                   _file_name + '.flac',
                                   const.config.folder)
        assert return_code == expect_return_code


class TestEmbedMetadata:
    def test_embed_in_mp3(self):
        expect_embed = True
        global track_path
        track_path = os.path.join(const.config.folder, file_name)
        embed = metadata.embed(track_path + '.mp3', meta_tags)
        assert embed == expect_embed

    def test_embed_in_m4a(self):
        expect_embed = True
        embed = metadata.embed(track_path + '.m4a', meta_tags)
        os.remove(track_path + '.m4a')
        assert embed == expect_embed

    def test_embed_in_webm(self):
        expect_embed = False
        embed = metadata.embed(track_path + '.webm', meta_tags)
        os.remove(track_path + '.webm')
        assert embed == expect_embed

    def test_embed_in_flac(self):
        expect_embed = True
        embed = metadata.embed(track_path + '.flac', meta_tags)
        os.remove(track_path + '.flac')
        assert embed == expect_embed


def test_check_track_exists_after_download():
    const.config.overwrite = 'skip'
    expect_check = True
    check = spotdl._check_exists(tmp_dir, file_name, raw_song, meta_tags)
    os.remove(track_path + '.mp3')
    assert check == expect_check
