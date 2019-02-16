
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

        self.status_message = "Canceled Downloader"

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
        self.status_message = "Init Downloader"

        try:
            self.init_date = time.localtime()

            self.download()

            self.end_date = time.localtime()

            log.info("Finished Downloader")

            self.status_message = "Finished Downloader"
        except Exception as e:
            log.error("Error in Downloader", exc_info=True)

            self.status_message = "Error in Downloader: {0}".format(str(e))

            self.end_date = time.localtime()

            raise Exception("Error in Downloader")

    def get_status(self):
        if not self.future:
            return (DownloadStatus.STOPPED, self.status_message)
        elif self.future.running():
            return (DownloadStatus.RUNNING, self._get_status_message())
        elif self.future.cancelled():
            return (DownloadStatus.CANCELLED, self.status_message)
        elif self.future.done() and self.future.exception():
            return (DownloadStatus.ERROR, self.status_message)
        elif self.future.done():
            return (DownloadStatus.FINISHED, self.status_message)
        else:
            return (DownloadStatus.STOPPED, self.status_message)


class SpotifyDownloader(Downloader):
    def __init__(self, url):
        super().__init__()

        self.url = url
        self.status_message = ""

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name
        else:
            return ''

    def _get_status_message(self):
        return self.status_message

    def _set_status_message(self, msg):
        self.status_message = msg

    def download(self):
        playlist_name, songs = spotdl.fetch(self.url)

        self.name = playlist_name

        spotdl.download(playlist_name, songs,
                        lambda s: self._set_status_message(s))
