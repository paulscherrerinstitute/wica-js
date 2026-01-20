###############################################################################
# Dockerfile to support download of Wica-JS library in docker data container
###############################################################################

FROM alpine:latest AS nvm_build

# If we need to look inside this image we will do it as root.
USER root

# Set the working directory
WORKDIR /tmp

RUN apk add --update npm

COPY package.json .

RUN npm install

COPY eslint.config.js .
COPY rollup.config.js .
COPY .jsdoc.conf.json .
COPY ./src ./src

RUN npm run lint && npm run build


################################################################################
## 1.0 Define the application
################################################################################

FROM alpine:latest

# If we need to look inside this image we will do it as root.
USER root

# Set the working directory
WORKDIR /root


###############################################################################
# 2.0 Install any additional applications
###############################################################################


###############################################################################
# 3.0 Set up the application project structure
###############################################################################

# Create the directories needed by this application
RUN mkdir ./static ./static/wica_js_root ./static/wica_js_root/wica

# Populate the application directories as appropriate
COPY --from=nvm_build /tmp/dist/rel/* ./static/wica_js_root/wica/

RUN ls ./static/wica_js_root/

###############################################################################
# 4.0 Define the exposed volumes
###############################################################################

VOLUME /root/static/wica_js_root


###############################################################################
# 5.0 Define the ENTRYPOINT
###############################################################################

ENTRYPOINT ["/bin/sh"]
