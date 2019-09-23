###############################################################################
# Dockerfile to support download of Wica-JS library in docker container
###############################################################################

FROM alpine:latest

################################################################################
## 1.0 Define the application
################################################################################

# If we need to look inside this image we will do it as root.
USER root

# Set the working directory
WORKDIR /root

###############################################################################
# 2.0 Install any additional applications
###############################################################################

#RUN apk update && apk add --no-cache bash

###############################################################################
# 3.0 Set up the application project structure
###############################################################################

# Create the directories needed by this application
RUN mkdir ./static ./static/wica-js

# Perform a complete npm build cyle
# RUN npm run clean && npm run lint && npm run build && npm run docs

# Populate the application directories as appropriate
COPY ./dist/rel/wica.min.js ./static/wica-js

###############################################################################
# 4.0 Define the exposed volumes
###############################################################################

VOLUME /root/static/wica-js

###############################################################################
# 5.0 Define the ENTRYPOINT
###############################################################################

ENTRYPOINT /bin/sh
