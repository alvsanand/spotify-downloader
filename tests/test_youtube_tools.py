from core import config, const, internals, spotdl, spotify_tools, youtube_tools

config.init_config()
raw_song = "Tony's Videos VERY SHORT VIDEO 28.10.2016"
raw_song_spotify = 'https://open.spotify.com/track/33IOhptvC2Qoy2UhjiHXLV'
meta_tags = spotify_tools.generate_metadata(raw_song_spotify)

file_format = '{artist} - {track_name}'


class TestArgsManualResultCount:
    # Regresson test for issue #264
    def test_scrape(self):
        const.config.manual = True
        url = youtube_tools.GenerateYouTubeURL("she is still sleeping SAO",
                                               meta_tags=None)
        video_ids = url.scrape(bestmatch=False)
        # Web scraping gives us all videos on the 1st page
        assert len(video_ids) == 20

    def test_api(self):
        url = youtube_tools.GenerateYouTubeURL("she is still sleeping SAO",
                                               meta_tags=None)
        video_ids = url.api(bestmatch=False)
        const.config.manual = False
        # API gives us 50 videos (or as requested)
        assert len(video_ids) == 50


class TestYouTubeURL:
    def test_only_music_category(self):
        expect_urls = ('https://youtube.com/watch?v=f1GUj4dKYc0')
        const.config.music_videos_only = True
        url = youtube_tools.generate_youtube_url(raw_song, None)
        assert url in expect_urls

    def test_all_categories(self):
        expect_url = 'https://youtube.com/watch?v=qOOcy2-tmbk'
        const.config.music_videos_only = False
        url = youtube_tools.generate_youtube_url(raw_song, None)
        assert url == expect_url


class TestYouTubeTitle:
    def test_single_download_with_youtube_api(self):
        global content
        global title
        expect_title = "Tony's Videos VERY SHORT VIDEO 28.10.2016"
        key = 'AIzaSyAnItl3udec-Q1d5bkjKJGL-RgrKO_vU90'
        const.config.youtube_api_key = key
        youtube_tools.init()
        content = youtube_tools.go_pafy(raw_song, None)
        title = youtube_tools.get_youtube_title(content)
        assert title == expect_title

    def test_download_from_list_without_youtube_api(self):
        expect_title = "1. Tony's Videos VERY SHORT VIDEO 28.10.2016"
        const.config.youtube_api_key = None
        youtube_tools.init()
        content = youtube_tools.go_pafy(raw_song, None)
        title = youtube_tools.get_youtube_title(content, 1)
        assert title == expect_title


class TestDownload:
    def test_other(self, tmpdir):
        expect_download = False
        file_name = internals.sanitize(title)
        download = youtube_tools.download_song(
            tmpdir, file_name + '.fake_extension', content)
        assert download == expect_download

    def test_m4a(self, tmpdir):
        expect_download = True
        file_name = internals.sanitize(title)
        download = youtube_tools.download_song(
            tmpdir, file_name + '.m4a', content)
        assert download == expect_download


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
    const.config.folder = str(tmpdir)
    # prerequisites for determining filename
    songname = internals.format_string(file_format, meta_tags)
    global file_name
    file_name = internals.sanitize(songname)
    check = spotdl._check_exists(tmpdir, file_name, raw_song, meta_tags)
    assert check == expect_check
