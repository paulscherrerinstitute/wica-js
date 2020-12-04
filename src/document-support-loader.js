/**
 * Loads the services that are required to provide Wica support for the current HTML document.
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"
import {
    WicaElementConnectionAttributes,
    WicaElementEventAttributes,
    WicaElementTextRenderingAttributes,
    WicaStreamPropertyDefaults
} from './shared-definitions.js';

import {DocumentStreamBuilder} from "./document-stream-builder.js";
import {DocumentTextRenderer} from "./document-text-renderer.js";
import {DocumentEventManager} from "./document-event-manager.js";
import * as JsonUtilities from "./json5-wrapper.js";

export { DocumentSupportLoader }

/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in document-support-loader.js module...");

/**
 * Provides the functionality necessary to support a wica-aware html page.
 */
class DocumentSupportLoader
{
    /**
     * Constructs a new instance to work with the specified Wica Server.
     *
     * @param {!string} streamServerUrl - The URL of the Wica Server with whom
     *    this instance should communicate.
     *
     * @param {!boolean} withCssSupport - whether or not to load the CSS file when this
     *    class instance is activated. Default is true.
     *
     * @param {!boolean} withTextRendererSupport - whether or not to enable the wica
     *   HTML element text renderer when this class instance is activated. Default is true.
     */
    constructor( streamServerUrl, withCssSupport = true, withTextRendererSupport )
    {
        this.streamServerUrl = streamServerUrl;
        this.withCssSupport = withCssSupport;
        this.withTextRendererSupport = withTextRendererSupport
        this.documentStreamBuilder = new DocumentStreamBuilder( streamServerUrl, WicaStreamPropertyDefaults, WicaElementConnectionAttributes );
        this.documentTextRenderer = new DocumentTextRenderer( WicaElementConnectionAttributes, WicaElementTextRenderingAttributes );
        this.documentEventManager = new DocumentEventManager( WicaElementConnectionAttributes, WicaElementEventAttributes );
    }

    /**
     * Activates support for the current document.
     *
     * @param {number} [textRendererRefreshRate=100] - The rate at which the document's text renderer should run to update the
     *     visual state of the document's wica-aware elements.
     *
     * @param {number} [eventManagerRefreshRate=100] - The rate at which the document's event manager should run to fire
     *    notification events on the state of the document's wica-aware elements.
     */
    activate( textRendererRefreshRate = 100, eventManagerRefreshRate = 100 )
    {
        if ( this.withCssSupport )
        {
            log.log( "The CSS support feature has been enabled." );
            this.loadWicaCSS_();
        }
        else
        {
            log.log( "The CSS support feature has been disabled." );
        }

        JsonUtilities.load(() => {

            log.log( "Activating document stream builder..." );
            this.documentStreamBuilder.activate();
            log.log( "The document stream builder has been activated." );

            log.log( "Activating document event manager..." );
            this.documentEventManager.activate( eventManagerRefreshRate );
            log.log( "The document event manager has been activated." );

            if ( this.withTextRendererSupport )
            {
                log.log( "The document text renderer support feature has been enabled." );
                log.log( "Activating document text renderer..." );
                this.documentTextRenderer.activate( textRendererRefreshRate );
                log.log( "The document text renderer has been activated." );
            }
            else
            {
                log.log( "The document text renderer support feature has been disabled." );
            }
        });
    }

    /**
     * Shuts down support for the current document.
     */
    shutdown()
    {
        this.documentStreamBuilder.shutdown();
        this.documentEventManager.shutdown();

        // Only shutdown the text renderer if the feature was enabled.
        if ( this.withTextRendererSupport )
        {
            this.documentTextRenderer.shutdown();
        }
    }

    /**
     * Loads the CSS that is used to render the visual state of wica-aware elements
     * using dynamically changing information in the element's attributes.
     * @private
     */
    loadWicaCSS_()
    {
        // ENABLE use of streamServerUrl when calculating URL to load CSS.
        // It's currently not clear (2019-09-25) whether we ever need to prepend
        // streamServer URL to the request or whether we can assume in all situations
        // that the wia.css file is colocated at the same origin as the wica.js file.
        const prependStreamServerUrl = true;

        // This mechanism ensures that the Wica CSS file is loaded only once.
        if ( !document.getElementById('wica-css-id') )
        {
            const head = document.getElementsByTagName('head')[0];
            const link = document.createElement('link');
            link.id = 'wica-css-id';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href =  prependStreamServerUrl ? this.streamServerUrl + '/wica/wica.css' : './wica.css';
            link.media = 'all';
            head.appendChild(link);
        }
    }

}
