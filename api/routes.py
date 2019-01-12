from flask_cors import CORS
from flask import Blueprint, redirect, request
from flask import abort, jsonify

from api.downloaders import PlayListDownloader

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
        abort(400)

    url = request.json['url']

    log.info("Downloading url[%s]", url)

    if url not in current_downloads:
        downloader = PlayListDownloader(url)

        downloader.start()

        current_downloads[url] = downloader

        return jsonify({'status': 'OK'})
    else:
        return jsonify({'status': 'ALREADY_ADDED'})


@app.route('/playlist_info', methods=['POST'])
def playlist_info():

    if not request.json or not 'url' in request.json:
        abort(400)

    url = request.json['url']

    log.info("Downloading url[%s]", url)

    return jsonify(spotdl.fetch_playlist_info(url))


@app.route('/downloads', methods=['GET'])
def downloads():
    log.info("Retrieving downloads")

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
