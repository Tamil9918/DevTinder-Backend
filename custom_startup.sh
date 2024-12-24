#!/bin/bash

set -e

# Define a log function for debugging
log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") [startup.sh]: $*"
}

# Step 1: Start Tomcat to unpack GeoServer WAR file
log "Starting Tomcat to initialize GeoServer..."
catalina.sh start &  # Start Tomcat in the background

log "Waiting for GeoServer WAR to be unpacked..."
# Wait for the GeoServer application to be unzipped
while [ ! -d "$CATALINA_HOME/webapps/geoserver/WEB-INF" ]; do 
  sleep 2
done

log "GeoServer WAR unzipped. Stopping Tomcat to replace web.xml..."

# Step 2: Stop Tomcat to replace the web.xml
catalina.sh stop || log "Tomcat stop command failed. Continuing..."

# Step 3: Replace the web.xml with the custom one if it exists
if [ -f "$CONFIG_OVERRIDES_DIR/web.xml" ]; then
  log "Custom web.xml found at $CONFIG_OVERRIDES_DIR/web.xml. Replacing default web.xml..."
  rm -f "$CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml"
  cp "$CONFIG_OVERRIDES_DIR/web.xml" "$CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml"
  chmod 644 "$CATALINA_HOME/webapps/geoserver/WEB-INF/web.xml"
  log "Custom web.xml successfully replaced."
else
  log "Custom web.xml not found. Using default configuration."
fi

# Step 4: Restart Tomcat to apply changes
log "Restarting Tomcat to deploy GeoServer with the custom configuration..."
catalina.sh run  # Run Tomcat in the foreground

