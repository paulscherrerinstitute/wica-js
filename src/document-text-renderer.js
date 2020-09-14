/**
 * Provides support for rendering the textual content of all wica channel elements in the
 * current document.
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"
import * as DocumentUtilities from './document-utils.js'
import * as JsonUtilities from './json5-wrapper.js'

export { DocumentTextRenderer}


/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in document-text-renderer.js module...");

/**
 * The default precision to be used when rendering a wica channel element's text content with a numeric value.
 */
const DEFAULT_PRECISION = 8;

/**
 * Renders the textual content of all wica channel elements in the current document based on Wica attribute
 * information obtained from the Wica server on the backend.
 *
 * @static
 */
class DocumentTextRenderer
{
    /**
     * Constructs a new instance.
     *
     * @param {!module:shared-definitions.WicaElementConnectionAttributes} wicaElementConnectionAttributes - The
     *     names of the HTML element attributes that are to be used in the wica communication process.
     *     See {@link module:shared-definitions.WicaElementConnectionAttributes WicaElementConnectionAttributes}.
     *
     * @param {!module:shared-definitions.WicaElementTextRenderingAttributes} wicaElementTextRenderingAttributes - The
     *     names of the HTML element attributes that are to be used in the wica text rendering process.
     *     See {@link module:shared-definitions.WicaElementRenderingAttributes WicaElementRenderingAttributes}.
     */
    constructor( wicaElementConnectionAttributes, wicaElementTextRenderingAttributes,  )
    {
        this.wicaElementConnectionAttributes= wicaElementConnectionAttributes;
        this.wicaElementTextRenderingAttributes = wicaElementTextRenderingAttributes;
    }

    /**
     * Starts periodically scanning the current document and updating the text content of all wica channel
     * elements to match the information obtained from the wica server.
     *
     * @param {number} [refreshRateInMilliseconds=100] - The period to wait after each update scan before
     *     starting the next one.
     *
     * See also: {@link module:document-text-renderer.DocumentTextRenderer#shutdown shutdown}.
     */
    activate( refreshRateInMilliseconds = 100 )
    {
        // Search the entire document for all wica channel elements.
        // Optimisation: cache the retrieved information for use during future scanning.
        this.wicaChannelElements = DocumentUtilities.findWicaChannelElements( document.documentElement );

        // Start update process if not already active. Otherwise do nothing.
        if ( this.intervalTimer === undefined )
        {
            JsonUtilities.load( () => this.doScan_( refreshRateInMilliseconds ) );
        }
    }

    /**
     * Shuts down the service offered by this class.
     *
     * See also: {@link module:document-text-renderer.DocumentTextRenderer#activate activate}.
     */
    shutdown()
    {
        // Stop update process if already active. otherwise do nothing.
        if ( this.intervalTimer !== undefined )
        {
            clearInterval( this.intervalTimer );
            this.intervalTimer = undefined;
        }
    }


    /**
     * Performs a single update cycle, then schedules the next one.
     *
     * @param {number} refreshRateInMilliseconds - The period to wait after every update scan before starting
     *     the next one.
     * @private
     */
    doScan_( refreshRateInMilliseconds )
    {
        try
        {
            this.renderWicaElements_( this.wicaElementConnectionAttributes.channelName,
                                      this.wicaElementConnectionAttributes.channelMetadata,
                                      this.wicaElementConnectionAttributes.channelValueArray,
                                      this.wicaElementTextRenderingAttributes.tooltip,
                                      this.wicaElementTextRenderingAttributes.renderingProperties );
        }
        catch( err )
        {
            DocumentTextRenderer.logExceptionData_("Programming Error: renderWicaElements_ threw an exception: ", err );
        }

        // Reschedule next update
        this.intervalTimer = setTimeout(() => this.doScan_( refreshRateInMilliseconds ), refreshRateInMilliseconds );
    }


    /**
     * Renders the textual content of all HTML elements in the current document that include wica-channel definitions.
     *
     * @param {string} channelNameAttribute - The name of the attribute which holds the channel name.
     * @param {string} channelMetadataAttribute - The name of the attribute which holds the channel metadata.
     * @param {string} channelValueArrayAttribute - The name of the attribute which holds channel value array.
     * @param {string} tooltipAttribute - The name of the attribute which holds the tooltip.
     * @param {string} renderingPropertiesAttribute - The name of the attribute which holds the properties
     *     needed for rendering.
     * @private
     */
    renderWicaElements_( channelNameAttribute, channelMetadataAttribute, channelValueArrayAttribute, tooltipAttribute, renderingPropertiesAttribute )
    {
        this.wicaChannelElements.forEach( (element) =>
        {
            // Get the element's rendering properties object if available
            // Note: since this attribute is configured by the user as a JSON string it's important
            // to validate the data and to output some diagnostic message if there is a problem.
            const renderingProperties = DocumentTextRenderer.getRenderingProperties( element, renderingPropertiesAttribute, channelNameAttribute );

            // Bail out if rendering is disabled for this widget
            const disableRendering = {}.hasOwnProperty.call( renderingProperties, "disable" ) ? renderingProperties.disable : false;
            if ( disableRendering )
            {
                return;
            }

            // Bail out if the channel's metadata and current value are not both available
            if ( ( ! element.hasAttribute( channelMetadataAttribute ) ) || ( ! element.hasAttribute( channelValueArrayAttribute ) ) )
            {
                return;
            }

            // Get the channel value object
            const channelValueArray = JsonUtilities.parse( element.getAttribute( channelValueArrayAttribute ) );

            // Bail out if the value obtained from the stream was not an array
            if ( ! Array.isArray( channelValueArray ) )
            {
                log.warn("Stream error: received value object that was not an array !");
                return;
            }

            // Bail out if there isn't at least one value present.
            if ( channelValueArray.length === 0 )
            {
                return;
            }

            // Bail out if the latest value indicates that the channel is offline.
            const channelValueLatest = channelValueArray.pop();
            if ( channelValueLatest.val === null )
            {
                return;
            }

            // Get the channel metadata object
            const channelMetadata = JsonUtilities.parse( element.getAttribute( channelMetadataAttribute ) );

            // Now render the widget's text content
            DocumentTextRenderer.renderWicaElementTextContent_( element, channelMetadata, channelValueLatest, renderingProperties );
        });
    }

    /**
     * Renders the element's textual content.
     *
     * @param {Element} element - The element.
     * @param {module:shared-definitions.WicaChannelMetadata} channelMetadata - the channel's metadata.
     * @param {module:shared-definitions.WicaChannelValue} channelValueLatest - the channel's latest value.
     * @param {module:shared-definitions.WicaTextRenderingProperties} renderingProperties - the channel's rendering properties.
     * @private
     */
    static renderWicaElementTextContent_( element, channelMetadata, channelValueLatest, renderingProperties )
    {
        const rawValue = channelValueLatest.val;

        // The renderer assigns units either from either the rendering properties "units" field if
        // available or from the metadata "egu" field if available. Otherwise it assigns blank.
        const units = {}.hasOwnProperty.call( renderingProperties, "units" ) ? renderingProperties.units :
                      {}.hasOwnProperty.call( channelMetadata, "egu" ) ? channelMetadata.egu : "";

        switch ( channelMetadata.type )
        {
            case "REAL_ARRAY":
            case "INTEGER_ARRAY":
            case "STRING_ARRAY":
                element.textContent = JsonUtilities.stringify( rawValue );
                break;

            case "REAL": {
                const useExponentialFormat = {}.hasOwnProperty.call(renderingProperties, "exp") ? renderingProperties.exp : false;
                const precision = Math.min({}.hasOwnProperty.call(renderingProperties, "prec") ? renderingProperties.prec : channelMetadata.prec, DEFAULT_PRECISION);
                // TODO: Look at improved deserialisation of NaN's, Infinity etc
                // TODO: The backend serialiser has been changed (2019-02-02) to the more rigorous implementation of
                // TODO: sending Nan and Infinity as numbers not strings. Need to check whether the implementation
                // TODO: here still works.
                if ((rawValue === "Infinity") || (rawValue === "NaN")) {
                    // This was required in earlier versions of the backend server where Infinity
                    // and Nan was sent as a JSON string. Since 2019-02-02 should no longer be required.
                    log.warn("Programming error: unexpected JSON String format for numeric value of NaN or Infinity.");
                    element.textContent = rawValue;
                } else if (useExponentialFormat) {
                    element.textContent = rawValue.toExponential(precision) + " " + units;
                } else {
                    element.textContent = rawValue.toFixed(precision) + " " + units;
                }
                break;
            }

            case "INTEGER":
                // TODO: Look at improved deserialisation of NaN's, Infinity etc
                // TODO: The backend serialiser has been changed (2019-02-02) to the more rigorous implementation of
                // TODO: sending Nan and Infinity as numbers not strings. Need to check whether the implementation
                // TODO: here still works.
                if ( rawValue === "Infinity" )
                {
                    // This was required in earlier versions of the backend server where Infinity
                    // and Nan was sent as a JSON string. Since 2019-02-02 should no longer be required.
                    log.warn( "Programming error: unexpected JSON String format for numeric value of NaN or Infinity." );
                    element.textContent = rawValue;
                }
                else
                {
                    element.textContent = rawValue + " " + units;
                }
                break;

            case "STRING":
                element.textContent = rawValue;
                break;

            default:
                element.textContent = rawValue;
                break;
        }
    }

    /**
     * Configure the element's tooltip attribute.
     *
     * @implNote
     *
     * The wica CSS rules ensure that when the browser's cursor hovers over the element of interest a
     * a window will be automatically popped up to display the contents of the string specified by the
     * element's tooltip attribute.
     *
     * The implementation here does nothing if the tooltip attribute has already been set explicitly in
     * the HTML document and if the set value matches the channel name. If this condition is not met
     * then the tooltipAttribute value is copied from the channelNameAttribute.
     *
     * @param {Element} element - The element.
     * @param {string} tooltipAttribute - The name of the attribute which contains the tooltip.
     * @param {string} channelNameAttribute - The name of the attribute which contains the channel name.
     * @private
     */
    static configureWicaElementToolTip_( element, tooltipAttribute, channelNameAttribute )
    {
        const channelName = element.getAttribute( channelNameAttribute );
        if (  ! element.hasAttribute( tooltipAttribute ) )
        {
            element.setAttribute( tooltipAttribute, channelName );
            return;
        }

        if (  element.getAttribute( tooltipAttribute ) !== channelName  )
        {
            element.setAttribute( tooltipAttribute, channelName );
            return;
        }

    }

    /**
     * Attempts to return a JS WicaRenderingProperties object using the JSON string that may optionally
     * be present in the element's rendering properties attribute.
     *
     * @private
     * @param {Element} element - The element.
     * @param {string} renderingPropertiesAttribute - The name of the element's HTML attribute which
     *      contains the rendering properties.
     * @param {string} channelNameAttribute - The name of the attribute which contains the channel name.
     * @return {module:shared-definitions.WicaTextRenderingProperties} - the object, or {} if for any reason it cannot be obtained
     *     from the element's HTML attribute.
     */
    static getRenderingProperties( element, renderingPropertiesAttribute, channelNameAttribute )
    {
        const channelName = element.getAttribute( channelNameAttribute );
        const renderingPropertiesString = element.hasAttribute( renderingPropertiesAttribute ) ? element.getAttribute( renderingPropertiesAttribute ) : "{}";
        try
        {
            return JsonUtilities.parse( renderingPropertiesString );
        }
        catch( err )
        {
            DocumentTextRenderer.logExceptionData_( channelName + ": Illegal JSON format in '" + renderingPropertiesAttribute + "' attribute.\nDetails were as follows:\n", err);
            return {};
        }
    }

    /**
     * Log any error data generated in this class.
     *
     * @param {string} msg - custom error message.
     * @param {Error} err - the Error object
     * @private
     */
    static logExceptionData_( msg, err )
    {
        let vDebug = "";
        for ( const prop in err )
        {
            if ( {}.hasOwnProperty.call( err, prop ) )
            {
                vDebug += "property: " + prop + " value: [" + err[ prop ] + "]\n";
            }
        }
        vDebug += "Details: [" + err.toString() + "]";
        log.warn( msg + vDebug );
    }

}