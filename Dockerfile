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

# Copy the startup script to the container
COPY custom_startup.sh /usr/local/bin/startup.sh

# Make sure the startup script is executable
RUN chmod +x /usr/local/bin/startup.sh

# Use the custom startup script as the container's entry point
CMD ["/usr/local/bin/startup.sh"]
