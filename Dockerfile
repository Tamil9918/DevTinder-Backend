FROM tomcat:9-jdk11

# Set environment variables
ENV GEOSERVER_VERSION=2.20.7 \
    GEOSERVER_DATA_DIR=/var/local/geoserver_data \
    CATALINA_HOME=/usr/local/tomcat \
    CATALINA_BASE=/usr/local/tomcat

# Install dependencies and clean up
RUN apt-get update && apt-get install -y unzip && \
    rm -rf /var/lib/apt/lists/*

# Copy GeoServer WAR file from the root folder
COPY geoserver.war $CATALINA_HOME/webapps/geoserver.war

# Ensure the GeoServer data directory is created
RUN mkdir -p ${GEOSERVER_DATA_DIR} && \
    chown -R root:root ${GEOSERVER_DATA_DIR}

# Copy custom web.xml to a temporary location
COPY web.xml /usr/local/web.xml

# Expose the required ports
EXPOSE 8080

# Set up volume for GeoServer data directory
#VOLUME ["${GEOSERVER_DATA_DIR}"]

# Script to handle deployment and web.xml replacement at runtime
RUN echo '#!/bin/bash' > /usr/local/bin/startup.sh && \
    echo 'catalina.sh run &' >> /usr/local/bin/startup.sh && \
    echo 'while [ ! -d "$CATALINA_HOME/webapps/geoserver/WEB-INF" ]; do sleep 1; done' >> /usr/local/bin/startup.sh && \
    echo 'cp /usr/local/web.xml $CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml' >> /usr/local/bin/startup.sh && \
    echo 'wait' >> /usr/local/bin/startup.sh && \
    chmod +x /usr/local/bin/startup.sh

# Use the custom startup script to run the container
CMD ["/usr/local/bin/startup.sh"]
