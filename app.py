from core import const
from core.const import log
from core import youtube_tools
from core import handle

from flask import Flask, render_template, redirect
from webapp.routes import app as routes
from flask_cors import CORS
import os
from core.const import log

def init():
    log.info("Launching spotwebapp")

    const.args = handle.load_config()
    
    const.log = const.logzero.setup_logger(formatter=const._formatter,
                                           level=const.args.log_level)
    youtube_tools.set_api_key()


init()

log.info("Launching Flash app")

app = Flask(__name__, static_url_path='')
# Delete only for dev
CORS(app)

SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY

app.register_blueprint(routes, url_prefix='/')

log.info("Loaded routes")
log.info(app.url_map)

app.run(debug = True, threaded=True)

    