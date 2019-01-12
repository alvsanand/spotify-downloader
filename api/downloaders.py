
import concurrent.futures.thread as thread
from enum import Enum
from core import const
from core.const import log

from core import spotdl


class DownloadStatus(Enum):
    STOPPED = "STOPPED"
    CANCELLED = "CANCELLED"
    RUNNING = "RUNNING"
    FINISHED = "FINISHED"
    ERROR = "ERROR"


downloaders = thread.ThreadPoolExecutor(int(const.config.max_downloads))


class Downloader:
    def __init__(self):
        self.future = None

    def start(self):
        log.info("Starting PlayListDownloader")

        self.future = downloaders.submit(self.run)

    def stop(self):
        log.info("Stopping PlayListDownloader")

        if self.future:
            return self.future.cancel()
        else:
            return False

    def getName(self):
        pass

    def download(self):
        pass

    def run(self):
        log.info("Init Downloader")

        try:
            self.download()

            log.info("Finished Downloader")
        except Exception:
            log.error("Error in Downloader", exc_info=True)

    def getStatus(self):
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


class PlayListDownloader(Downloader):
    def __init__(self, url):
        super().__init__()

        self.url = url

    def getName(self):
        if hasattr(self, 'name'):
            return self.name
        else:
            return ''

    def download(self):
        playlist_name, songs = spotdl.fetch_playlist(self.url)

        self.name = playlist_name

        spotdl.download_playlist(playlist_name, songs)
