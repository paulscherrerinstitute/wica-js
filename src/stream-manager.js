/**
 * Provides support for creating and using Wica streams.
 * @module stream-manager
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"
import * as JsonUtilities from './json5-wrapper.js'

export {StreamManager}

/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in stream-manager.js module...");

/**
 * Callback invoked when the stream connect sequence begins.
 *
 * @callback module:stream-manager.StreamConnectCallback
 * @param {number} count - The connection request counter. The counter, set to 1 initially, increments
 *     after every stream connection attempt. This information is useful mainly for debug purposes (for
 *     example for outputting a message to the console).
 * @returns {void}
 */

/**
 * Callback invoked when the stream is opened (that's to say when the connection with the server
 * has been successfully established).
 *
 * @callback module:stream-manager.StreamOpenedCallback
 * @param {string} id - The ID of the stream that was opened. This information is useful mainly
 *    for debug purposes (for example for outputting a message to the console).
 * @returns {void}
 */

/**
 * Callback invoked when the stream is closed (that's to say when the connection with the server
 * has been shut down).
 *
 * @callback module:stream-manager.StreamClosedCallback
 * @param {string} id - The ID of the stream that was closed. This information is useful mainly
 *    for debug purposes (for example for outputting a message to the console).
 * @returns {void}
 */

/**
 * @callback module:stream-manager.ChannelMetadataUpdatedCallback
 * @param {Object.<WicaChannelName, WicaChannelMetadata>} metadataMap - Map of channel names and their
 *     associated metadata. See {@link module:shared-definitions.WicaChannelName} and
 *     {@link module:shared-definitions.WicaChannelMetadata}.
 * @returns {void}
 */

/**
 * @callback module:stream-manager.ChannelValuesUpdatedCallback
 * @param {Object.<WicaChannelName,WicaChannelValue[]>} valueMap - Map of channel names and array of
 *     associated values that have been received for the channel in chronological order.
 *     See {@link module:shared-definitions.WicaChannelName} and
 *     {@link module:shared-definitions.WicaChannelValue}.
 * @returns {void}
 */

/**
 * Provides support for creating a new WicaStream on the Wica server, for subscribing to it and for
 * publishing the received information.
 */
class StreamManager
{
    /**
     * Constructs a new instance.
     *
     * The returned object will remain in a dormant state until triggered by a call to the activate method.
     *
     * @param {string} serverUrl - The URL of the server that will create the new stream.
     *
     * @param {Object} streamConfiguration - The stream specification sent to the server, including channel
     *     configurations and optional stream properties.
     * @param {Array<{name:module:shared-definitions.WicaChannelName, properties: module:shared-definitions.WicaChannelProperties}>} streamConfiguration.channels - Object
     *     specifying the configuration of each wica channel in the stream.
     * @param {module:shared-definitions.WicaStreamProperties} [streamConfiguration.props] - Optional stream-level
     *     properties.
     *
     * @param {Object} connectionHandlers - Callback functions for handling connection state changes.
     * @param {module:stream-manager.StreamConnectCallback} connectionHandlers.streamConnect - Called when the
     *     stream manager begins a new connect sequence. See {@link module:stream-manager.StreamConnectCallback}.
     * @param {module:stream-manager.StreamOpenedCallback} connectionHandlers.streamOpened - Called when the stream
     *     is successfully opened. See {@link module:stream-manager.StreamOpenedCallback}.
     * @param {module:stream-manager.StreamClosedCallback} connectionHandlers.streamClosed - Called when the stream
     *      is closed. See {@link module:stream-manager.StreamClosedCallback}.
     *
     * @param {Object} messageHandlers -  Callbacks for handling SSE data messages.
     * @param {module:stream-manager.ChannelMetadataUpdatedCallback} messageHandlers.channelMetadataUpdated - Called
     *     when new channel metadata is received. See {@link module:stream-manager.ChannelMetadataUpdatedCallback}.
     * @param {module:stream-manager.ChannelValuesUpdatedCallback} messageHandlers.channelValuesUpdated - Called
     *     when new channel value data is received. See {@link module:stream-manager.ChannelValuesUpdatedCallback}.
     *
     * @param {Object} [options] - Optional client-side configuration.
     * @param {number} [options.streamTimeoutIntervalInSeconds] - Maximum permitted interval between heartbeat messages.
     * @param {number} [options.streamReconnectIntervalInSeconds] - Delay between reconnect attempts after an outage.
     * @param {boolean} [options.crossOriginCheckEnable] - Whether CORS origin checks should be performed.
     * @param {boolean} [options.asyncStreamDeleteEnable] - Whether to delete the stream using navigator.sendBeacon
     *      (true) or a blocking HTTP DELETE request (false).
     */
    constructor( serverUrl,
                 streamConfiguration,
                 connectionHandlers,
                 messageHandlers,
                 options )
    {
        this.serverUrl = serverUrl;
        this.streamConfiguration = streamConfiguration;

        // Extract the connection handler components
        this.streamOpened = connectionHandlers.streamOpened;
        this.streamConnect = connectionHandlers.streamConnect;
        this.streamClosed = connectionHandlers.streamClosed;

        // Extract the message handler components
        this.channelMetadataUpdated = messageHandlers.channelMetadataUpdated;
        this.channelValuesUpdated = messageHandlers.channelValuesUpdated;

        // Extract the option components
        this.streamReconnectIntervalInSeconds = options.streamReconnectIntervalInSeconds;
        this.streamTimeoutIntervalInSeconds = options.streamTimeoutIntervalInSeconds;
        this.crossOriginCheckEnable = options.crossOriginCheckEnable;
        this.asyncStreamDeleteEnable = options.asyncStreamDeleteEnable;
        this.countdownInSeconds = 0;
        this.connectionRequestCounter = 1;
        this.activeStreamId = undefined;
        this.eventSource = undefined;
    }

    /**
     * Activates this stream manager instance.
     *
     * More specifically this sets up a state machine to create and manage an active event stream
     * and for calling other handlers as required to track the evolving connection state and received
     * data.
     *
     * See also: {@link module:stream-manager.StreamManager#shutdown}.
     *
     * @implNote
     * The current implementation expects to receive a periodic "heartbeat" message to confirm
     * that the connection to the data server is ok. If the message is not received within the
     * allowed time window then the existing stream will be closed and a new stream will be
     * negotiated with the server.
     */
    activate()
    {
        // Activation has to wait until we received the callback that the
        // JSON5 library is loaded.
        JsonUtilities.load( () => this.startStreamMonitoring_() )
    }

    /**
     * Shuts down this stream manager instance.
     *
     * See also: {@link module:stream-manager.StreamManager#activate}.
     */
    shutdown()
    {
        // If the stream manager is activated cancel the interval timer.
        if( this.intervalTimer !== undefined )
        {
            clearInterval( this.intervalTimer );
        }

        // Send an HTTPS command to cancel the most recently established stream
        // (if one has been established). This may, or may-not get delivered to
        // the server, but gives it at least the chance to shut down the stream
        // gracefully.
        if ( this.activeStreamId !== undefined )
        {
            if ( this.asyncStreamDeleteEnable ) {
                this.deleteStreamAsync_( this.activeStreamId );
            }
            else {
                this.deleteStream_(this.activeStreamId );
            }
        }

        // If an EventSource is already active then close it. This will cause
        // the browser to stop consuming data sent from the server and is the
        // fundamental (and brutal !) way that the server can in all cases
        // learn that the server-sent-event stream is no longer being consumed.
        if ( this.eventSource !== undefined ) {
            this.eventSource.close();
        }

    }

    /**
     * Sends an HTTP POST request to the Wica Server to delete an existing
     * stream.
     *
     * This version does not block and in theory does not impair the
     * user's web experience.
     *
     * The implementation here make use of the navigator.sendBeacon
     * function which is provided specifically for the purpose of
     * sending short messages before unloading a page.
     *
     * @private
     * @param {string} streamId the ID of the stream to be deleted.
     */
    deleteStreamAsync_( streamId )
    {
        log.info( "Asynchronously deleting stream with id: ", streamId );
        const deleteUrl = this.serverUrl + "/ca/streams/" + streamId;
        navigator.sendBeacon( deleteUrl, "DELETE" );
    }

    /**
     * Sends an HTTP DELETE request to the Wica Server to delete an
     * existing stream.
     *
     * This version blocks waiting for the response from the Wica server.
     * This approach is now (2020-03-13) disallowed by modern browsers such
     * as Chrome. See the information here:
     * https://www.chromestatus.com/feature/4664843055398912
     *
     * @private
     * @param {string} streamId the ID of the stream to be deleted.
     */
    deleteStream_( streamId )
    {
        // Create a request object which will be used to ask the server to create the new stream.
        const xhttp = new XMLHttpRequest();

        // Add a handler which will print an error message if the stream couldn't be deleted.
        xhttp.onerror = () => {
            log.warn( "XHTTP error when sending request to delete event source" );
        };

        // Add a handler which will subscribe to the stream once it has been created.
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                const deletedId = xhttp.responseText;
                log.info( "Stream deleted, deleted id was: ", deletedId );
            }
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status !== 200) {
                log.warn( "Error when sending delete stream request." );
            }
        };

        // Now send off the request. Note async is FALSE so that the page does not
        // get a chance to unload before the request has been sent.
        const deleteUrl = this.serverUrl + "/ca/streams/" + streamId;
        xhttp.withCredentials = true;
        xhttp.open("DELETE", deleteUrl, false );
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send();
    }

    /**
     * Starts the stream monitoring process.
     *
     * @private
     */
    startStreamMonitoring_()
    {
        const ONE_SECOND_IN_TIMER_UNITS = 1000;
        this.intervalTimer = setInterval( () => {
            if ( this.countdownInSeconds === 0 ) {
                log.log( "Event source 'stream': creating new...");
                // Set up an asynchronous chain of events that will create a stream
                // then subscribe to it, then start monitoring it. If the heartbeat
                // signal is not seen the process will repeat itself after the
                // heartbeat interval timeout.
                this.createStream_();
                log.log( "Event source: 'stream' - OK: create event stream task started");
                this.countdownInSeconds = this.streamReconnectIntervalInSeconds;
            }
            this.countdownInSeconds--;
        }, ONE_SECOND_IN_TIMER_UNITS );
    }
    /**
     * Sends a POST request to the Wica Server to create a new stream. Adds a handler to
     * subscribe to the stream once it has been created.
     *
     * @private
     */
    createStream_()
    {
        // Inform listeners that a stream connection attempt is in progress
        this.streamConnect( this.connectionRequestCounter++ );

        // Create a request object which will be used to ask the server to create the new stream.
        const xhttp = new XMLHttpRequest();

        // Add a handler which will print an error message if the stream couldn't be created.
        xhttp.onerror = () => {
            log.warn( "XHTTP error when sending request to create event source" );
        };

        // Add a handler which will subscribe to the stream once it has been created.
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                const streamId = xhttp.responseText;
                log.log( "Stream created, returned id is: ", streamId );
                const subscribeUrl = this.serverUrl + "/ca/streams/" + streamId;
                this.subscribeStream_( subscribeUrl );
            }
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status !== 200) {
                log.warn( "Error when sending create stream request." );
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
     * Creates an EventSource and adds an EventListener which will result in a GET
     * request being sent to the Wica Server to subscribe to the specified streams.
     * Adds handlers to deal with the various events and/or messages which may be
     * associated with the stream.
     *
     * @private
     * @param subscribeUrl the stream subscription URL.
     */
    subscribeStream_( subscribeUrl )
    {
        this.eventSource = new EventSource( subscribeUrl, { withCredentials: true } );

        // The heartbeat message is for internal use of this stream handler.
        // If a heartbeat isn't received periodically then the connection
        // will be deemed to have failed, triggering a new stream creation
        // and subscription cycle.
        this.eventSource.addEventListener( 'ev-wica-server-heartbeat', ev => {
            if ( this.crossOriginCheckOk_( ev ) ) {
                const evSrc = ev.target;
                const evSrcUrl = evSrc.url;
                const id = StreamManager.extractEventSourceStreamIdFromUrl_( evSrcUrl );
                log.log( "Event source: 'wica stream' - heartbeat event on stream with id: " + id );
                this.countdownInSeconds = this.streamTimeoutIntervalInSeconds;
            }
        }, false) ;

        this.eventSource.addEventListener( 'ev-wica-channel-metadata',ev => {
            if ( this.crossOriginCheckOk_( ev ) ) {
                const metadataArrayObject = JsonUtilities.parse( ev.data );
                this.channelMetadataUpdated( metadataArrayObject );
            }

        }, false);

        this.eventSource.addEventListener( 'ev-wica-channel-value', ev => {
            if ( this.crossOriginCheckOk_( ev ) ) {
                const valueArrayObject = JsonUtilities.parse( ev.data );
                this.channelValuesUpdated( valueArrayObject );
            }
        }, false);

        this.eventSource.addEventListener( 'open', ev => {
            if ( this.crossOriginCheckOk_( ev ) ) {
                const evSrc = ev.target;
                const evSrcUrl = evSrc.url;
                const id = StreamManager.extractEventSourceStreamIdFromUrl_( evSrcUrl );
                this.streamOpened( id );
                log.log( "Event source: 'wica stream' - open event on stream with id: " + id );
                this.activeStreamId = id;
            }
        }, false);

        this.eventSource.addEventListener( 'error', ev => {
            if ( this.crossOriginCheckOk_( ev ) ) {
                const evSrc = ev.target;
                const evSrcUrl = evSrc.url;
                const id = StreamManager.extractEventSourceStreamIdFromUrl_( evSrcUrl );
                log.warn("Event source: 'wica stream'  - error event on stream with id: " + id );
                evSrc.close();  // close the event source that triggered this message
                this.streamClosed( id );
            }

        }, false);
    }

    /**
     * Performs a CORS check to verify the origin of the supplied event
     * is the same as the origin of the page that is currently loaded.
     *
     * @private
     * @param event the event to check
     * @returns boolean result, true when the check is ok.
     */
    crossOriginCheckOk_( event )
    {
        if ( ! this.crossOriginCheckEnable ) {
            return true;
        }

        const expectedOrigin = location.origin;
        if ( event.origin === expectedOrigin ) {
            return true;
        }
        else {
            log.warn( "Event source: 'stream' unexpected event origin." );
            return false;
        }
    }

    /**
     * Extracts the last part of the url which is expected to contain the stream id.
     *
     * @private
     * @param {string} url
     * @returns {string}
     */
    static extractEventSourceStreamIdFromUrl_( url )
    {
        const idx = url.lastIndexOf("/") + 1;
        return url.substring(idx);
    }
}