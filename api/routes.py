from flask import Blueprint, abort, jsonify, redirect, request

from api.downloaders import SpotifyDownloader
from core import config, const, spotdl
from core.const import log

app = Blueprint('/', 'main')


@app.errorhandler(400)
def custom400(error):
    res = jsonify({'error': error.description})
    res.status_code = 400
    return res


@app.errorhandler(500)
def custom500(error):
    res = jsonify({'error': error.description})
    res.status_code = 500
    return res


@app.route('/', methods=['GET'])
def index():
    return redirect("/index.html", code=302)


current_downloads = {}


@app.route('/download', methods=['POST'])
def post_download():
    if not request.json or 'url' not in request.json:
        abort(400, 'Error downloading playlist info: url obligatory')

    try:
        url = request.json['url']

        log.info("Downloading url[%s]", url)

        if url not in current_downloads:
            downloader = SpotifyDownloader(url)

            downloader.start()

            current_downloads[url] = downloader

            return jsonify({'status': 'OK'})
        else:
            return jsonify({'status': 'ALREADY_ADDED'})
    except Exception:
        log.error("Error downloading playlist info", exc_info=True)

        abort(400, 'Error downloading playlist info')


@app.route('/info', methods=['POST'])
def info():
    if not request.json or 'url' not in request.json:
        abort(400, 'Error getting playlist info: url obligatory')

    try:
        url = request.json['url']

        log.info("Get playlist info[%s]", url)

        info = spotdl.fetch_info(url)

        return jsonify(info)
    except Exception:
        log.error("Error getting playlist info", exc_info=True)

        abort(500, 'Error getting playlist info')


@app.route('/youtube', methods=['GET'])
def youtube():
    if 'url' not in request.args:
        abort(400,
              'Error getting playlist redirecting to youtube: url obligatory')

    try:
        url = request.args['url']

        log.info("Redirecting to youtube[%s]", url)

        yt_url = spotdl.fetch_yt_url(url)

        return redirect(yt_url, code=302)
    except Exception:
        log.error("Error redirecting to youtube", exc_info=True)

        abort(500, 'Error redirecting to youtube')


@app.route('/search', methods=['POST'])
def search():
    if not request.json or 'query' not in request.json:
        abort(400, 'Error searching: query obligatory')

    try:
        query = request.json['query']

        log.info("Searching[%s]", query)

        items = spotdl.search(query, max_results_per_type=int(
            const.config.search_max_results))

        return jsonify(items)
    except Exception:
        log.error("Error searching", exc_info=True)

        abort(500, 'Error searching')


@app.route('/download_history', methods=['GET'])
def download_history():
    log.info("Retrieving download_history")

    try:
        items = list(map(lambda d: {
            'url': d[0],
            'name': d[1].get_name(),
            'status': d[1].get_status().__dict__,
            'init_date': d[1].get_init_date(format="%H:%M:%S"),
            'end_date': d[1].get_end_date(format="%H:%M:%S"),
        },
            current_downloads.items()))

        response = {
            'items': items
        }

        return jsonify(response)
    except Exception:
        log.error("Error retrieving download_history", exc_info=True)

        abort(500, 'Error retrieving download_history')


@app.route('/settings', methods=['GET'])
def get_settings():
    log.info("Retrieving settings")

    try:
        settings = {
            'settings': config.get_config_dict()
        }

        return jsonify(settings)
    except Exception:
        log.error("Error Retrieving settings", exc_info=True)

        abort(500, 'Error Retrieving settings')


@app.route('/settings', methods=['PUT'])
def put_settings():
    if not request.json or 'settings' not in request.json:
        abort(400, 'Error Saving settings: settings obligatory')

    log.info("Saving settings")

    try:
        config.save_config(request.json['settings'])

        config.init_config()

        return jsonify({'status': 'OK'})
    except Exception:
        log.error("Error Saving settings", exc_info=True)

        abort(500, 'Error Saving settings')
