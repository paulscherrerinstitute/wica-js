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
     * @param {!boolean} autoloadCss - whether or not to automatically load
     *   the CSS file when this class instance is activated. Default is true.
     */
    constructor( streamServerUrl, autoloadCss = true )
    {
        this.streamServerUrl = streamServerUrl;
        this.autoloadCss = autoloadCss
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
        if ( this.autoloadCss )
        {
            log.log( "The CSS autoload feature has been enabled." );
            this.loadWicaCSS_();
        }
        else
        {
            log.log( "The CSS autoload feature has been disabled." );
        }

        JsonUtilities.load(() => {
            this.documentStreamBuilder.activate();
            this.documentTextRenderer.activate( textRendererRefreshRate );
            this.documentEventManager.activate( eventManagerRefreshRate );
        });
    }

    /**
     * Shuts down support for the current document.
     */
    shutdown()
    {
        this.documentStreamBuilder.shutdown();
        this.documentTextRenderer.shutdown();
        this.documentEventManager.shutdown();
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
