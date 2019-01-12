from core import const
from core.const import log
from core import youtube_tools
from core import config

from flask import Flask, render_template, redirect
import os


def init():
    log.info("Launching Spotify-Downloader")

    const.config = config.load_config()

    const.log = const.logzero.setup_logger(formatter=const._formatter,
                                           level=const.config.log_level)
    youtube_tools.set_api_key()


def main():
    init()

    from api.routes import app as routes

    log.info("Launching Flash app")

    app = Flask(__name__, static_url_path='')

    SECRET_KEY = os.urandom(32)
    app.config['SECRET_KEY'] = SECRET_KEY

    app.register_blueprint(routes, url_prefix='/')

    log.info("Loaded routes")
    log.info(app.url_map)

    app.run(host='0.0.0.0', threaded=True)


if __name__ == "__main__":
    main()
