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


# Create directory for configuration overrides
RUN mkdir -p ${CONFIG_OVERRIDES_DIR}

# Copy custom web.xml to the configuration overrides directory (if available)
# This will be overridden by a ConfigMap in Kubernetes
COPY web.xml ${CONFIG_OVERRIDES_DIR}/web.xml

# Startup script
RUN echo '#!/bin/bash' > /usr/local/bin/startup.sh && \
    echo 'set -e' >> /usr/local/bin/startup.sh && \
    echo 'log() { echo "$(date +"%Y-%m-%d %H:%M:%S") [startup.sh]: $*"; }' >> /usr/local/bin/startup.sh && \
    echo 'log "Disabling auto-deployment by renaming geoserver.war..."' >> /usr/local/bin/startup.sh && \
    echo 'mv "$CATALINA_HOME/webapps/geoserver.war" "$CATALINA_HOME/webapps/geoserver.war.disabled"' >> /usr/local/bin/startup.sh && \
    echo 'log "Starting Tomcat to initialize GeoServer WAR..."' >> /usr/local/bin/startup.sh && \
    echo 'catalina.sh start &' >> /usr/local/bin/startup.sh && \
    echo 'log "Waiting for GeoServer WAR to be unzipped..."' >> /usr/local/bin/startup.sh && \
    echo 'while [ ! -d "$CATALINA_HOME/webapps/geoserver/WEB-INF" ]; do sleep 2; done' >> /usr/local/bin/startup.sh && \
    echo 'log "GeoServer WAR unzipped."' >> /usr/local/bin/startup.sh && \
    echo 'if [ -f "$CONFIG_OVERRIDES_DIR/web.xml" ]; then' >> /usr/local/bin/startup.sh && \
    echo '  log "Custom web.xml found at $CONFIG_OVERRIDES_DIR/web.xml. Replacing default web.xml..."' >> /usr/local/bin/startup.sh && \
    echo '  rm -f "$CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml"' >> /usr/local/bin/startup.sh && \
    echo '  cp "$CONFIG_OVERRIDES_DIR/web.xml" "$CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml"' >> /usr/local/bin/startup.sh && \
    echo '  chmod 644 "$CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml"' >> /usr/local/bin/startup.sh && \
    echo '  log "Custom web.xml successfully replaced."' >> /usr/local/bin/startup.sh && \
    echo 'else' >> /usr/local/bin/startup.sh && \
    echo '  log "Custom web.xml not found. Using default configuration."' >> /usr/local/bin/startup.sh && \
    echo 'fi' >> /usr/local/bin/startup.sh && \
    echo 'log "Re-enabling GeoServer WAR for deployment..."' >> /usr/local/bin/startup.sh && \
    echo 'mv "$CATALINA_HOME/webapps/geoserver.war.disabled" "$CATALINA_HOME/webapps/geoserver.war"' >> /usr/local/bin/startup.sh && \
    echo 'log "Restarting Tomcat to deploy GeoServer..."' >> /usr/local/bin/startup.sh && \
    echo 'catalina.sh stop || log "Tomcat stop command failed. Continuing..."' >> /usr/local/bin/startup.sh && \
    echo 'sleep 5' >> /usr/local/bin/startup.sh && \
    echo 'catalina.sh run' >> /usr/local/bin/startup.sh && \
    chmod +x /usr/local/bin/startup.sh

# Use the custom startup script as the container's entry point
CMD ["/usr/local/bin/startup.sh"]
