/**
 * Provides support for updating the current document with live information from the data sources on the backend.
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"
import * as DocumentUtilities from './document-utils.js'
import {DocumentStreamConnector} from "./document-stream-connector";
export { DocumentStreamBuilder }


/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in document-stream-builder.js module...");

/**
 * Scans the current document for HTML elements which provide wica stream definitions.
 * Sets up Document Stream Connectors for each discovered instance.
 */
class DocumentStreamBuilder
{
    /**
     * Constructs a new instance to work with the specified backend server.
     *
     * The returned object will remain in a dormant state until triggered by a call to the
     *     {@link module:document-stream-builder.DocumentStreamBuilderr#activate activate} method.
     *
     * @param {!string} streamServerUrl - The URL of the backend server from whom information is to be obtained.
     *
     * @param {!module:shared-definitions.WicaStreamProperties} wicaStreamPropertyDefaults - The default properties
     *     for the streams created by this builder. Individual stream properties may be overridden by the explicit
     *     definitions on the wica stream HTML elements.
     *     See {@link module:shared-definitions.WicaStreamProperties WicaStreamProperties}.
     *
     * @param {!module:shared-definitions.WicaElementConnectionAttributes} wicaElementConnectionAttributes - The
     *     names of the HTML element attributes that are to be used in the wica communication process.
     *     See {@link module:shared-definitions~WicaElementConnectionAttributes WicaElementConnectionAttributes}.
     */
    constructor( streamServerUrl, wicaStreamPropertyDefaults, wicaElementConnectionAttributes )
    {
        this.streamServerUrl = streamServerUrl;
        this.wicaStreamPropertyDefaults = wicaStreamPropertyDefaults;
        this.wicaElementConnectionAttributes = wicaElementConnectionAttributes;
        this.documentStreamConnectors = [];
     }

    /**
     * Scans the current document for wica-stream elements, creates streams on the Wica backend server to obtain
     * information for each element's data source, sets up handlers to update each element's attributes on
     * the basis of the received information.
     *
     * See also: {@link module:document-stream-builder.DocumentStreamBuilder#shutdown shutdown}.
     */
    activate()
    {
        // Search the current document for all wica stream elements.
        const wicaStreamElements = DocumentUtilities.findWicaStreamElements( document );

        // Provide some diagnostics of stream elements that have been found in the document.
        log.info( "Building new document stream connector. Number of wica stream elements found in document: ", wicaStreamElements.length );

        // For each wica stream element create and activate a document stream connector.
        // If a wica stream properties attribute is available use the values to override the default stream properties
        wicaStreamElements.forEach( (widget) =>
        {
            const streamPropertiesAttribute = this.wicaElementConnectionAttributes.streamProperties;
            const streamPropertyOverrideObject = widget.hasAttribute( streamPropertiesAttribute ) ? widget.getAttribute( streamPropertiesAttribute ) : {};
            const streamProperties = this.buildStreamProperties_( streamPropertyOverrideObject );
            const documentStreamConnector = new DocumentStreamConnector( widget, this.streamServerUrl, streamProperties, this.wicaElementConnectionAttributes );
            this.documentStreamConnectors.push( documentStreamConnector );
            documentStreamConnector.activate();
        });
    }

    /**
     * Shuts down the streams that were earlier built by this class.
     *
     * See also: {@link module:document-stream-builder.DocumentStreamBuilder#shutdown activate}.
     */
    shutdown()
    {
        this.documentStreamConnectors.forEach( (documentStreamConnector) =>
        {
            documentStreamConnector.shutdown();
        });
    }

    /**
     * Returns an object consisting of the default stream properties overridden by any properties
     * specified by the supplied overrides object.
     *
     * @param streamPropertyOverrideObject the object providing properties to override.
     * @return {*} the result.
     * @private
     */
    buildStreamProperties_( streamPropertyOverrideObject )
    {
        const result = Object.assign( this.wicaStreamPropertyDefaults, streamPropertyOverrideObject )
        return result;
    }
}
