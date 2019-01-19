FROM python:3.6-alpine

RUN apk add --no-cache \
    ffmpeg \
    nodejs nodejs-npm \
    linux-headers libc-dev gcc 

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
ADD core/ /spotify-downloader/core
ADD api/ /spotify-downloader/api

RUN chmod a+rw /spotify-downloader

WORKDIR /spotify-downloader

ENTRYPOINT ["python", "app.py"]
