export class WicaStreamManager
{
    /**
     * Creates an object for handling the Server-Sent-Event (SSE) data stream with the Wica backend server.
     *
     * Note: The returned manager will remain in an inactive state until it is activated by a call to
     *       its activate method.
     *
     * @param {string} serverUrl - the url of the server hosting the Wica Stream.
     *
     * @param {Object} streamConfiguration - The configuration of the stream which should include the
     *        stream properties (if any), the name of the channels, and associated channel properties.
     * @param {Object} connectionHandlers - Callbacks for handling connection state changes.
     * @param {callback} connectionHandlers.streamOpened - Called when the stream is opened (= not yet connected)
     * @param {callback} connectionHandlers.streamConnect - Called when the stream sucessfully connects.
     * @param {callback} connectionHandlers.streamClosed - Called when the stream disconnects.
     *
     * @param {Object} messageHandlers - Callbacks for handling data received from the SSE stream.
     * @param {callback} messageHandlers.channelMetadataUpdated -  Called when stream metadata information is received.
     * @param {callback} connectionHandlers.channelValuesUpdated - Called when stream value information is received.
     *
     * @param {Object} options - Object providing miscellaneous configuration options.
     * @param {number} options.streamReconnectIntervalInSeconds - how often the manager should attempt to reconnect
     *                                                            with the server if there is a communication outage.
     *
     * @param {number} options.streamTimeoutIntervalInSeconds - how often the stream's heartbeat signal need's
     *                                                         to be received before the channel connection will
     *                                                         be deemed to have failed.
     *
     * @param {boolean} options.crossOriginCheckEnabled - whether this manager should perform a CORS check.
     */
    constructor( serverUrl, streamConfiguration, connectionHandlers, messageHandlers, options )
    {
        this.serverUrl = serverUrl;
        this.streamConfiguration = streamConfiguration;
        this.streamOpened = connectionHandlers.streamOpened;
        this.streamConnect = connectionHandlers.streamConnect;
        this.streamClosed = connectionHandlers.streamClosed;
        this.channelMetadataUpdated = messageHandlers.channelMetadataUpdated;
        this.channelValuesUpdated = messageHandlers.channelValuesUpdated;
        this.streamReconnectIntervalInSeconds = options.streamReconnectIntervalInSeconds;
        this.streamTimeoutIntervalInSeconds = options.streamTimeoutIntervalInSeconds;
        this.crossOriginCheckEnabled = options.crossOriginCheckEnabled;

        this.countdownInSeconds = 0;
    }

    /**
     * Sets up a plan for managing the event stream, calling other handlers as required.
     *
     * If the countdownTimer reaches zero the stream will be reccreated.
     */
    activate()
    {
        const ONE_SECOND_IN_TIMER_UNITS = 1000;
        setInterval( () => {
            if ( this.countdownInSeconds === 0 ) {
                console.warn("Event source 'stream': creating new...");
                this.createStream();
                console.warn("Event source: 'stream' - OK: create event stream task started");
                this.countdownInSeconds = this.streamReconnectIntervalInSeconds;
            }
            this.countdownInSeconds--;
        }, ONE_SECOND_IN_TIMER_UNITS );
    }

    /**
     * Sends a POST request to the Wica Server to create a new stream. Adds a handler to
     * subscribe to the stream once it has been created.
     */
    createStream()
    {
        // Inform listeners that a stream connection attempt is in progress
        this.streamConnect();

        // Create a request object which will be used to ask the server to create the new stream.
        const xhttp = new XMLHttpRequest();

        // Add a handler which will print an error message if the stream couldn't be created.
        xhttp.onerror = () => {
            console.warn( "XHTTP error when sending request to create event source" );
        };

        // Add a handler which will subscribe to the stream once it has been created.
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                const streamId = xhttp.responseText;
                console.warn( "Stream created, returned id is: ", streamId );
                const subscribeUrl = this.serverUrl + "/ca/streams/" + streamId;
                this.subscribeStream( subscribeUrl );
            }
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status !== 200) {
                console.warn( "Error when sending create stream request." );
            }
        };

        // Now send off the request
        const createUrl = this.serverUrl + "/ca/streams";
        xhttp.withCredentials = true;
        xhttp.open("POST", createUrl, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        const jsonStreamConfiguration = JSON.stringify( this.streamConfiguration );
        xhttp.send( jsonStreamConfiguration );
    }

    /**
     * Sends a GET request to the Wica Server to subscribe to the specified streams.
     * Adds handlers to deal with the various events and/or messages which may be
     * associated with the stream.
     *
     * @param subscribeUrl the stream subscription URL.
     */
    subscribeStream( subscribeUrl )
    {
        const eventSource = new EventSource( subscribeUrl, { withCredentials: true } );

        // The heartbeat message is for internal use of this stream handler.
        // If a heartbeat isn't received periodically then the connection
        // will be deemed to have failed, triggering a new stream creation
        // and subscription cycle.
        eventSource.addEventListener( 'ev-wica-server-heartbeat', ev => {
            if ( this.crossOriginCheckOk( ev ) ) {
                this.countdownInSeconds = this.streamTimeoutIntervalInSeconds;
            }
        }, false) ;

        eventSource.addEventListener( 'ev-wica-channel-metadata',ev => {
            if ( this.crossOriginCheckOk( ev ) ) {
                const metadataArrayObject = JSON.parse( ev.data );
                this.channelMetadataUpdated( metadataArrayObject );
            }

        }, false);

        eventSource.addEventListener( 'ev-wica-channel-value', ev => {
            if ( this.crossOriginCheckOk( ev ) ) {
                const valueArrayObject = JSON.parse( ev.data );
                this.channelValuesUpdated( valueArrayObject );
            }
        }, false);

        eventSource.addEventListener( 'open', ev => {
            if ( this.crossOriginCheckOk( ev ) ) {
                const id = WicaStreamManager.extractEventSourceStreamIdFromUrl( ev.target.url );
                this.streamOpened( id );
                console.warn("Event source: 'stream' - open event on stream with id: " + id );
            }
        }, false);

        eventSource.addEventListener( 'error', ev => {
            if ( this.crossOriginCheckOk( ev ) ) {
                const id = WicaStreamManager.extractEventSourceStreamIdFromUrl( ev.target.url );
                console.warn("Event source: 'stream'  - error event on stream with id: " + id );
                ev.target.close();  // close the event source that triggered this message
                this.streamClosed( id );
            }

        }, false);
    }

    /**
     * Performs a CORS check to verify the origin of the supplied event
     * is the same as the origin of the page that is currently loaded.
     *
     * @param event the event to check
     * @returns boolean result, true when the check is ok.
     */
    crossOriginCheckOk( event )
    {
        if ( ! this.crossOriginCheckEnabled ) {
            return true;
        }

        const expectedOrigin = location.origin;
        if ( event.origin === expectedOrigin ) {
            return true;
        }
        else {
            console.warn( "Event source: 'stream' unexpected event origin." );
            return false;
        }
    }

    /**
     * Extracts the last part of the url which is expected to contain the stream id.
     *
     * @param url
     * @returns {string}
     */
    static extractEventSourceStreamIdFromUrl( url )
    {
        return url.substr( url.lastIndexOf( "/" ) + 1 );
    }
}