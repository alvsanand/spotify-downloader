from flask_cors import CORS
from flask import Blueprint, redirect, request
from flask import abort, jsonify

from api.downloaders import PlayListDownloader

from core import config
from core import const
from core.const import log
from core import spotdl

app = Blueprint('/', 'main')


@app.errorhandler(404)
def page_not_found(error):
    return 'Rota com problema {}'.format(request.url), 404


@app.route('/', methods=['GET'])
def index():
    return redirect("/index.html", code=302)


current_downloads = {}


@app.route('/download', methods=['POST'])
def post_download():
    if not request.json or not 'url' in request.json:
        abort({'error': 'Error downloading playlist info: url obligatory'}, 400)

    try:
        url = request.json['url']

        log.info("Downloading url[%s]", url)

        if url not in current_downloads:
            downloader = PlayListDownloader(url)

            downloader.start()

            current_downloads[url] = downloader

            return jsonify({'status': 'OK'})
        else:
            return jsonify({'status': 'ALREADY_ADDED'})
    except:
        log.error("Error downloading playlist info", exc_info=True)

        abort({'error': 'Error downloading playlist info'}, 400)


@app.route('/playlist_info', methods=['POST'])
def playlist_info():
    if not request.json or not 'url' in request.json:
        abort({'error': 'Error getting playlist info: url obligatory'}, 400)

    try:
        url = request.json['url']

        log.info("Get playlist info[%s]", url)

        info = spotdl.fetch_playlist_info(url)

        return jsonify(info)
    except:
        log.error("Error getting playlist info", exc_info=True)

        abort({'error': 'Error getting playlist info'}, 500)


@app.route('/downloads', methods=['GET'])
def downloads():
    log.info("Retrieving downloads")

    try:
        items = list(map(lambda d: {
            'url': d[0],
            'name': d[1].getName(),
            'status': d[1].getStatus().value,
        },
            current_downloads.items()))

        response = {
            'items': items
        }  

        return jsonify(response)
    except:
        log.error("Error Saving settings", exc_info=True)

        abort({'error': 'Error Saving settings'}, 500)


@app.route('/settings', methods=['GET'])
def get_settings():
    log.info("Retrieving settings")

    try:
        settings = {
            'settings': config.get_config_dict()
        }

        return jsonify(settings)
    except:
        log.error("Error Retrieving settings", exc_info=True)

        abort({'error': 'Error Retrieving settings'}, 500)



@app.route('/settings', methods=['PUT'])
def put_settings():
    if not request.json or not 'settings' in request.json:
        abort({'error': 'Error Saving settings: settings obligatory'}, 400)

    log.info("Saving settings")

    try:
        config.save_config(request.json['settings'])

        return jsonify({'status': 'OK'})
    except:
        log.error("Error Saving settings", exc_info=True)

        abort({'error': 'Error Saving settings'}, 500)
