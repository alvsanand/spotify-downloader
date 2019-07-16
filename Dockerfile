FROM python:3.6-alpine

RUN set -ex && \
    apk add --no-cache \
    ffmpeg \
    nodejs nodejs-npm \
    linux-headers libc-dev gcc sudo

ADD react-ui/ /spotify-downloader/react-ui
RUN cd /spotify-downloader/react-ui \
    && npm install \
    && npm run build \
    && cp -R build/ ../static \
    && cd / \
    && rm -Rf  /spotify-downloader/react-ui

ADD requirements.txt /spotify-downloader/
RUN pip install -r /spotify-downloader/requirements.txt

ADD app.py /spotify-downloader/
ADD docker-entrypoint.sh /spotify-downloader/
ADD core/ /spotify-downloader/core
ADD api/ /spotify-downloader/api
ADD api/ /spotify-downloader/api

RUN adduser -h /spotify-downloader --disabled-password --gecos '' spotify-downloader && \
    sed -e 's/# %wheel ALL=(ALL) NOPASSWD: ALL/%wheel ALL=(ALL) NOPASSWD: ALL/g' -i /etc/sudoers && \
    sed -e 's/^wheel:\(.*\)/wheel:\1,spotify-downloader/g' -i /etc/group && \
    chown -R spotify-downloader:spotify-downloader /spotify-downloader

USER spotify-downloader
WORKDIR /spotify-downloader

CMD ["/spotify-downloader/docker-entrypoint.sh"]
