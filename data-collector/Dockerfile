FROM denoland/deno:1.29.4

COPY . /data-collector
WORKDIR /data-collector

RUN apt-get update &&\
    apt-get install -y ca-certificates tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

ENTRYPOINT ["/tini", "--"]
# CMD ["/bin/bash", "-c", "deno run --allow-all src/index.js"]
