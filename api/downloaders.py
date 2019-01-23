
import concurrent.futures.thread as thread
import time
from enum import Enum

from core import const, spotdl
from core.const import log


class DownloadStatus(Enum):
    STOPPED = "STOPPED"
    CANCELLED = "CANCELLED"
    RUNNING = "RUNNING"
    FINISHED = "FINISHED"
    ERROR = "ERROR"


_downloaders_thread_pool = None


def init():
    global _downloaders_thread_pool

    if _downloaders_thread_pool:
        _downloaders_thread_pool.shutdown()
    _downloaders_thread_pool = thread.ThreadPoolExecutor(
        int(const.config.max_downloads))


class Downloader:
    def __init__(self):
        self.future = None
        self.init_date = None
        self.end_date = None

    def start(self):
        log.info("Starting PlayListDownloader")

        self.future = _downloaders_thread_pool.submit(self.run)

    def stop(self):
        log.info("Stopping PlayListDownloader")

        if self.future:
            return self.future.cancel()
        else:
            return False

    def get_name(self):
        pass

    def get_init_date(self, format=None):
        if format and self.init_date:
            return time.strftime(format, self.init_date)

        return self.init_date

    def get_end_date(self, format=None):
        if format and self.end_date:
            return time.strftime(format, self.end_date)

    def download(self):
        pass

    def run(self):
        log.info("Init Downloader")

        try:
            self.init_date = time.localtime()

            self.download()

            self.end_date = time.localtime()

            log.info("Finished Downloader")
        except Exception:
            log.error("Error in Downloader", exc_info=True)

            self.end_date = time.localtime()

            raise Exception("Error in Downloader")

    def get_status(self):
        if not self.future:
            return DownloadStatus.STOPPED
        elif self.future.running():
            return DownloadStatus.RUNNING
        elif self.future.cancelled():
            return DownloadStatus.CANCELLED
        elif self.future.done() and self.future.exception():
            return DownloadStatus.ERROR
        elif self.future.done():
            return DownloadStatus.FINISHED
        else:
            return DownloadStatus.STOPPED


class SpotifyDownloader(Downloader):
    def __init__(self, url):
        super().__init__()

        self.url = url

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name
        else:
            return ''

    def download(self):
        playlist_name, songs = spotdl.fetch(self.url)

        self.name = playlist_name

        spotdl.download(playlist_name, songs)
