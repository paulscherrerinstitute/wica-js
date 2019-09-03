###############################################################################
# Dockerfile to support download of Wica-JS library in docker container
###############################################################################

FROM alpine:latest

################################################################################
## 1.0 Define the application
################################################################################

# If we need to look inside thism image we will do it as root.
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
RUN mkdir ./wica

# Populate the application directories as appropriate
COPY ./src/wica/ ./wica

###############################################################################
# 4.0 Define the exposed volumes
###############################################################################

VOLUME /root/wica

###############################################################################
# 5.0 Define the ENTRYPOINT
###############################################################################

ENTRYPOINT /bin/sh
