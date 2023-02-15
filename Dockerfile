ARG PYTHON_IMG_TAG=3.9



FROM docker.io/python:${PYTHON_IMG_TAG}-slim-bullseye as base
ARG PYTHON_IMG_TAG
LABEL sjac.org.python-img-tag="${PYTHON_IMG_TAG}" \
      sjac.org.maintainer="tech@syriaaccountability.org"
RUN set -ex \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install \
    -y --no-install-recommends \
        locales \
    && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*
# Set locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8



FROM base as build
RUN set -ex \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install \
    -y --no-install-recommends \
        git \
        build-essential \
        gcc \
        python3-dev \
        libpq-dev \
        libxml2-dev \
        libssl-dev \
        libffi-dev \
        libjpeg62-turbo-dev \
        libzip-dev \
        libxslt1-dev \
        libncurses5-dev \
        libimage-exiftool-perl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/python
COPY ./requirements.txt .
# Install deps, including CKAN
RUN pip install --user --no-warn-script-location \
    --no-cache-dir -r ./requirements.txt



FROM base as runtime
ARG PYTHON_IMG_TAG
WORKDIR /opt/app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    DEPS_DIR="/opt/python" \
    PATH="/opt/python/.local/bin:$PATH" \
    FLASK_APP=run.py \
    C_FORCE_ROOT="true"
# TODO given more time I would strip deps down to essentials (pinned non '-dev' versions)
RUN set -ex \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install \
    -y --no-install-recommends \
        libpq-dev \
        libxml2-dev \
        libssl-dev \
        libffi-dev \
        libjpeg62-turbo-dev \
        libzip-dev \
        libxslt1-dev \
        libncurses5-dev \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build \
    /root/.local \
    $DEPS_DIR/.local
# Upgrade pip & pre-compile deps to .pyc, add app user, permissions, aliases
RUN python -c "import compileall; compileall.compile_path(maxlevels=10, quiet=1)" \
    && python -c "import compileall; compileall.compile_path(maxlevels=10, quiet=1)" \
    && useradd -r -u 900 -m -c "non-priv user" -d $DEPS_DIR -s /bin/false appuser \
    && chown -R appuser:appuser $DEPS_DIR \
    # alias below is redundant?
    && echo 'alias act="source env/bin/activate"' >> ~/.bashrc \
    && echo 'alias ee="export FLASK_APP=run.py && export FLASK_DEBUG=0"' >> ~/.bashrc
USER appuser
COPY . .
# TODO optimise uwsgi worker, ideally use gunicorn
CMD [ "uwsgi", "--http", "0.0.0.0:5000", \
               "--protocol", "uwsgi", \
               "--wsgi", "run:app" ]

