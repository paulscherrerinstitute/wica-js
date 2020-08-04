/**
 * Provides support for updating the current document with live information from the data sources on the backend.
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"
import {StreamManager} from './stream-manager.js'
import * as DocumentUtilities from './document-utils.js'
import * as JsonUtilities from './json5-wrapper.js'

export { DocumentStreamConnector }


/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in document-stream-connector.js module...");

/**
 * Provides real-time updates to wica channel elements in the supplied document tree based on
 * information streamed from the Wica server on the backend.
 *
 * @static
 */
class DocumentStreamConnector
{
    /**
     * Constructs a new instance to work with the specified backend server.
     *
     * The returned object will remain in a dormant state until triggered by a call to the
     *     {@link module:document-stream-connector.DocumentStreamConnector#activate activate} method.
     *
     * @param  {!string} streamName - The name of this stream (which will be reflected on the
     *
     * @param {!Element} rootElement - the root of the document tree to be searched when looking for wica
     *    channel elements.
     *
     * @param {!string} streamServerUrl - The URL of the backend server from whom information is to be obtained.
     *
     * @param {!module:shared-definitions.WicaStreamProperties} wicaStreamProperties - The properties of the stream that
     *     will be created to obtain the required information from the data sources.
     *     See {@link module:shared-definitions.WicaStreamProperties WicaStreamProperties}.
     *
     * @param {!module:shared-definitions.WicaElementConnectionAttributes} wicaElementConnectionAttributes - The names
     *     of the wica html element attributes that are to be used in the wica communication process.
     *     See {@link module:shared-definitions.WicaElementConnectionAttributes WicaElementConnectionAttributes}.
     */
    constructor( streamName, rootElement, streamServerUrl, wicaStreamProperties, wicaElementConnectionAttributes )
    {
        this.streamName = streamName;
        this.rootElement = rootElement;
        this.streamServerUrl = streamServerUrl;
        this.wicaStreamProperties = wicaStreamProperties;
        this.wicaElementConnectionAttributes = wicaElementConnectionAttributes;
        this.lastOpenedStreamId = 0;
        this.streamConnectionHandlers = {};
        this.streamMessageHandlers = {};
        this.wicaChannelElements = [];
        this.wicaElementLookupTable = {};
    }

    /**
     * Scans the specified document tree for wica channel elements, creates a stream on the Wica backend server to
     * obtain information from each element's data source, sets up handlers to update each element's attributes on
     * as fresh information is received .
     *
     * See also: {@link module:document-stream-connector.DocumentStreamConnector#shutdown shutdown}.
     */
    activate()
    {
        // Search the current document starting at the specified root element for all wica channel elements.
        // Optimisation: cache the retrieved information for use during future scanning.
        this.wicaChannelElements = DocumentUtilities.findWicaChannelElements( this.rootElement );

        this.configureStreamNameAttributes_( this.wicaElementConnectionAttributes.streamName );

        this.configureStreamConnectionHandlers_( this.wicaElementConnectionAttributes.streamState );

        this.configureStreamMessageHandlers_( this.wicaElementConnectionAttributes.channelMetadata,
                                              this.wicaElementConnectionAttributes.channelValueArray,
                                              this.wicaElementConnectionAttributes.channelValueLatest,
                                              this.wicaElementConnectionAttributes.channelConnectionState,
                                              this.wicaElementConnectionAttributes.channelAlarmState );

        this.buildStreamConfiguration_( this.wicaElementConnectionAttributes.channelName, this.wicaElementConnectionAttributes.channelProperties );
        this.buildWicaElementLookupTable_( this.wicaElementConnectionAttributes.channelName );
        this.createStream_();

        JsonUtilities.load(() => this.streamManager.activate() );
    }

    /**
     * Shuts down the service offered by this class.
     *
     * See also: {@link module:document-stream-connector.DocumentStreamConnector#shutdown activate}.
     */
    shutdown()
    {
        this.streamManager.shutdown();
    }

    /**
     * Configures the stream name attributes on all wica channel elements.
     *
     * @private
     * @param {string} streamNameAttribute - The attribute whose value is to be updated with the stream name.
     */
    configureStreamNameAttributes_( streamNameAttribute )
    {
        log.log("Setting wica stream name attribute on all html elements to: '" + this.streamName + "'" );
        this.wicaChannelElements.forEach( element => element.setAttribute( streamNameAttribute, this.streamName ) );
    }

    /**
     * Configures the document stream connection handling object to deal with the connection-related events generated
     * by the stream manager.
     *
     * @private
     * @param {string} streamConnectionStateAttribute - The attribute whose value is to be updated when the stream
     *     manager connects / is opened / is closed.
     */
    configureStreamConnectionHandlers_( streamConnectionStateAttribute )
    {
        this.streamConnectionHandlers.streamConnect = (count) => {
            log.log( "Event stream connect: " + count );
            log.log( "Setting wica stream state on all html channel elements to: 'connect-" + count + "'" );
            this.wicaChannelElements.forEach( element => element.setAttribute( streamConnectionStateAttribute, "connect-" + count ) );
        };

        this.streamConnectionHandlers.streamOpened = (id) => {
            log.log( "Event stream opened: " + id);
            log.log( "Setting wica stream state on all html channel elements to: 'opened-" + id + "'" );
            this.wicaChannelElements.forEach( element => element.setAttribute( streamConnectionStateAttribute, "opened-" + id));
            this.lastOpenedStreamId = id;
        };

        this.streamConnectionHandlers.streamClosed = (id) => {
            log.log("Event stream closed: " + id);
            if ( id === this.lastOpenedStreamId ) {
                log.log("Setting wica stream state on all html channel elements to: 'closed'");
                this.wicaChannelElements.forEach( element => element.setAttribute( streamConnectionStateAttribute, "closed-" + id));
            } else {
                log.log("Wica stream state on all html channel elements will be left unchanged as a newer event source is already open !");
            }
        };
    }

    /**
     * Configures the document stream connection handling object to deal with the message-related events generated
     * by the stream manager.

     * @param {string} channelMetadataAttribute
     * @param {string} channelValueArrayAttribute
     * @param {string} channelValueLatestAttribute
     * @param {string} channelConnectionStateAttribute
     * @param {string} channelAlarmStateAttribute
     * @private
     */
    configureStreamMessageHandlers_( channelMetadataAttribute, channelValueArrayAttribute,
                                     channelValueLatestAttribute, channelConnectionStateAttribute,
                                     channelAlarmStateAttribute )
    {
        this.streamMessageHandlers.channelMetadataUpdated = metadataMap => {
            this.updateDocumentMetadataAttributes_( metadataMap, channelMetadataAttribute);
        };

        this.streamMessageHandlers.channelValuesUpdated = valueMap => {
            this.updateDocumentValueAttributes_( valueMap, channelValueArrayAttribute, channelValueLatestAttribute,
                                                 channelConnectionStateAttribute, channelAlarmStateAttribute);
        }
    }

    /**
     * Creates the stream based on the wica channel elements in the document tree specified during construction.
     *
     * @private
     */
    createStream_()
    {
        // Note the streamReconnectIntervalInSeconds must be > streamTimeoutIntervalInSeconds
        // or multiple connections will occur.
        const streamManagerOptions = {
            streamReconnectIntervalInSeconds: 25,
            streamTimeoutIntervalInSeconds: 20,
            crossOriginCheckEnable: false,
            asyncStreamDeleteEnable: true
        };

        this.streamManager = new StreamManager( this.streamServerUrl,
                                                this.streamConfiguration,
                                                this.streamConnectionHandlers,
                                                this.streamMessageHandlers,
                                                streamManagerOptions );
    }

    /**
     * Builds the stream configuration based on the wica channel elements in the current document tree.
     *
     * @param channelNameAttribute
     * @param channelPropertiesAttribute
     * @private
     */
    buildStreamConfiguration_( channelNameAttribute, channelPropertiesAttribute )
    {
        // Provide some diagnostics on the number of elements that will be incorporated into the stream.
        log.info( "Building new stream configuration. Number of wica-aware elements found in document tree: ", this.wicaChannelElements.length );

        // Create an array of the associated channel names
        const channels = [];
        this.wicaChannelElements.forEach( (widget) =>
        {
            const channelName = widget.getAttribute( channelNameAttribute );
            if ( widget.hasAttribute( channelPropertiesAttribute ) )
            {
                const channelProps = widget.getAttribute( channelPropertiesAttribute );
                const channelConfiguration = { "name": channelName, "props": JsonUtilities.parse( channelProps ) };
                channels.push( channelConfiguration );
            }
            else
            {
                const channelConfiguration = { "name": channelName };
                channels.push( channelConfiguration );
            }
        });
        this.streamConfiguration = { "channels": channels, "props": this.wicaStreamProperties };
    }

    /**
     * Handles the arrival of a new metadata map from the stream-manager.
     *
     * @param metadataMap
     * @param channelMetadataAttribute
     * @private
     */
    updateDocumentMetadataAttributes_( metadataMap, channelMetadataAttribute )
    {
        log.trace("Event stream received new channel metadata map.");

        // Go through all the elements in the update object and assign each element's metadata to
        // the element's metadata attribute.
        Object.keys( metadataMap ).forEach((key) => {
            const channelName = key;
            const channelMetadata = metadataMap[key];
            const elements = this.findWicaElementsForChannelWithName_( channelName );
            const metadataAsString = JsonUtilities.stringify(channelMetadata);
            elements.forEach( ele => {
                ele.setAttribute( channelMetadataAttribute, metadataAsString);
                log.log( "Metadata updated on channel: '" + key + "', new value: '" + metadataAsString + "'" );
            });
        });
    }

    /**
     * Handles the arrival of a new value map from the stream manager.
     *
     * @param valueMap
     * @param channelValueArrayAttribute
     * @param channelValueLatestAttribute
     * @param channelConnectionStateAttribute
     * @param channelAlarmStateAttribute
     * @private
     */
    updateDocumentValueAttributes_( valueMap, channelValueArrayAttribute, channelValueLatestAttribute,
                                    channelConnectionStateAttribute, channelAlarmStateAttribute )
    {
        log.trace( "WicaStream received new channel value map.");

        // Go through all the elements in the update object and assign each element's value information
        // to the relevant element attributes.
        Object.keys( valueMap).forEach((key) => {
            const channelName = key;
            const channelValueArray = valueMap[key];
            const elements = this.findWicaElementsForChannelWithName_( channelName );
            const channelValueArrayAsString = JsonUtilities.stringify( channelValueArray );

            if (!Array.isArray( channelValueArray ) ) {
                log.warn("Stream Error: not an array !");
                return;
            }
            const channelValueLatest = channelValueArray.pop();
            const channelValueLatestAsString = JsonUtilities.stringify(channelValueLatest);
            const channelConnectionState = (channelValueLatest.val === null) ? "disconnected" : "connected";
            elements.forEach(ele => {
                ele.setAttribute( channelValueArrayAttribute, channelValueArrayAsString);
                ele.setAttribute( channelValueLatestAttribute, channelValueLatestAsString);
                ele.setAttribute( channelConnectionStateAttribute, channelConnectionState);
                ele.setAttribute( channelAlarmStateAttribute, channelValueLatest.sevr);
                log.log( "Value updated on channel: '" + key + "', new value: '" + channelValueLatestAsString + "'" );
            });
        });
    }

    /**
     * Create a lookup table of the HTML elements associated with each wica
     * channel in the current document.
     *
     * @param {!string} channelNameAttribute - the
     * @private
     */
    buildWicaElementLookupTable_( channelNameAttribute )
    {
        this.wicaChannelElements.forEach( (widget) =>
        {
            const channelName = widget.getAttribute( channelNameAttribute );
            this.saveLookupTableEntry_( channelName, widget )
        });
    }

    /**
     * Saves the association between the specified channel name and a wica element
     * with which it is associated (that's to say which needs to be updated should
     * its value or metadata changes).
     *
     * @param {!string} channelName - the name of the wica channel.
     * @param {!HTMLElement} wicaElement - an element with which it is associated.
     * @private
     */
    saveLookupTableEntry_( channelName, wicaElement )
    {
        if ( ! Array.isArray( this.wicaElementLookupTable[ channelName ] ) ) {
            this.wicaElementLookupTable[ channelName ] = [];
        }
        // Add the widget to the list of widgets whose attributes are to be
        // updated if the wica stream provides new information.
        this.wicaElementLookupTable[ channelName ].push( wicaElement );
    }

    /**
     * Retrieves an array of all wica elements associated with the specified channel.
     * @param channelName
     * @return {!HTMLElement[]} array of HTML elements with which the specified wica
     *    channel name is associated.
     * @private
     */
    findWicaElementsForChannelWithName_( channelName )
    {
        return Object.hasOwnProperty.call( this.wicaElementLookupTable, channelName ) ?
            this.wicaElementLookupTable[ channelName ] : [];
    }

}
