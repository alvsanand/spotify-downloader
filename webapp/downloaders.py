
import threading
from enum import Enum
from core.const import log

from core import spotdl

class DownloadStatus(Enum):
    STOPPED = "STOPPED"
    RUNNING = "RUNNING"
    FINISHED = "FINISHED"
    ERROR = "ERROR"


class Downloader:
    def __init__(self):
        self.status = DownloadStatus.STOPPED

        self.thread = threading.Thread(target=self.run, args=())
        self.thread.daemon = True

    def start(self):
        log.info("Starting PlayListDownloader")

        self.thread.start()

    def stop(self):
        log.info("Stopping PlayListDownloader")

        self.thread._stop()

    def getName(self):
        pass

    def download(self):
        pass

    def run(self):
        log.info("Init PlayListDownloader")

        self.status = DownloadStatus.RUNNING

        try:
            self.download()

            self.status = DownloadStatus.FINISHED

            log.info("Finished PlayListDownloader")
        except Exception:
            self.status = DownloadStatus.ERROR

            log.error("Error in PlayListDownloader", exc_info=True)

    def getStatus(self):
        return self.status


class PlayListDownloader(Downloader):
    def __init__(self, url):
        super().__init__()

        self.url = url
    
    def getName(self):
        return self.name

    def download(self):        
        playlist_name, songs = spotdl.fetch_playlist(self.url)
        
        self.name = playlist_name

        spotdl.download_playlist(playlist_name, songs)