# Use the Tomcat base image
FROM tomcat:9-jdk11

# Set environment variables
ENV GEOSERVER_VERSION=2.20.7 \
    GEOSERVER_DATA_DIR=/var/local/geoserver_data \
    CATALINA_HOME=/usr/local/tomcat \
    CATALINA_BASE=/usr/local/tomcat

# Install dependencies and clean up
RUN apt-get update && apt-get install -y unzip && \
    rm -rf /var/lib/apt/lists/*

# Copy GeoServer WAR file to Tomcat's webapps directory
COPY geoserver.war $CATALINA_HOME/webapps/geoserver.war

# Ensure the GeoServer data directory is created
RUN mkdir -p ${GEOSERVER_DATA_DIR} && \
    chown -R root:root ${GEOSERVER_DATA_DIR}

# Expose the required port for GeoServer
EXPOSE 8080

# Add a startup script to manage deployment and custom configuration
RUN echo '#!/bin/bash' > /usr/local/bin/startup.sh && \
    echo 'set -e' >> /usr/local/bin/startup.sh && \
    echo 'log() { echo "$(date +"%Y-%m-%d %H:%M:%S") [startup.sh]: $*"; }' >> /usr/local/bin/startup.sh && \
    echo 'log "Starting Tomcat..."; catalina.sh run &' >> /usr/local/bin/startup.sh && \
    echo 'log "Waiting for GeoServer to deploy..."; while [ ! -d "$CATALINA_HOME/webapps/geoserver/WEB-INF" ]; do sleep 2; done; log "GeoServer deployed."' >> /usr/local/bin/startup.sh && \
    echo 'CUSTOM_WEB_XML="/opt/config_overrides/web.xml"' >> /usr/local/bin/startup.sh && \
    echo 'DEFAULT_WEB_XML="$CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml"' >> /usr/local/bin/startup.sh && \
    echo 'if [ -f "$CUSTOM_WEB_XML" ]; then log "Custom web.xml found at $CUSTOM_WEB_XML."; if [ -f "$DEFAULT_WEB_XML" ]; then log "Removing default web.xml at $DEFAULT_WEB_XML..."; rm -f "$DEFAULT_WEB_XML"; fi; log "Copying custom web.xml to $DEFAULT_WEB_XML..."; cp "$CUSTOM_WEB_XML" "$DEFAULT_WEB_XML"; chmod 644 "$DEFAULT_WEB_XML"; else log "Custom web.xml not found. Default configuration will remain."; fi' >> /usr/local/bin/startup.sh && \
    echo 'wait' >> /usr/local/bin/startup.sh && \
    chmod +x /usr/local/bin/startup.sh

# Use the custom startup script as the container's entry point
CMD ["/usr/local/bin/startup.sh"]
