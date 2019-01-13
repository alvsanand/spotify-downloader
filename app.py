from core import const
from core.const import log
from core import youtube_tools
from core import config

from flask import Flask, render_template, redirect
import os


def init():
    log.info("Launching Spotify-Downloader")

    config.init_config()


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

    threaded = True
    if os.getenv('LOCAL_MODE', "false").lower() == "true":
        from flask_cors import CORS
        CORS(app)
        threaded = False

    app.run(host='0.0.0.0', threaded=threaded)


if __name__ == "__main__":
    main()
