/**
 * Provides the main entry point for supporting a Wica-aware HTML document.
 *
 * Normally Wica-JS library support should be loaded using the following definition:
 * <script src="/wica/wica.js" type="module"></script>
 *
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"

import { DocumentSupportLoader, StreamManager, PlotBuffer } from "./client-api.js"
export { DocumentSupportLoader, StreamManager, PlotBuffer }

/*- Script Execution Starts Here ---------------------------------------------*/

log.info( "Wica is loading support for the current document... ");

// Set up a variable that points to the script tag that was used
// to load wica. This can then be parsed to extract the HTML5 data-*
// options which specify the library's behaviour.
function getWicaScriptElement()
{
    // The algorithm below was inspired by the Stack Exchange discussion here:
    // https://stackoverflow.com/questions/403967/how-may-i-reference-the-script-tag-that-loaded-the-currently-executing-script
    const scripts = document.querySelectorAll( "script[src*= 'wica.js' ]" );
    if ( scripts.length === 1 ) {
        return scripts[ 0 ];
    }
    else {
        return null;
    }
}
const thisScriptEle = getWicaScriptElement();
if ( thisScriptEle === null ) {
    log.error( "The wica library could not be loaded since the wica script element could not be found." );
}

// Configure the logging level that will be used for this library. This can be
// overridden externally by loading the wica library with an HTML script tag
// that looks as follows:
// <script data-wica-log-level="XXX" src="wica/wica.js" type="module"></script>
const logLevel = thisScriptEle.hasAttribute( "data-wica-log-level" ) ?
    thisScriptEle.getAttribute("data-wica-log-level" ) :  log.logLevels.DEFAULT;
log.setLevel( logLevel );
log.info( "The wica library log level has been set to: ", logLevel );

// Configure whether to suppress automatic loading of the wica CSS definition file.
// The wica CSS definition file supports features such as tooltip hover and alarm state
// colourisation. The CSS load feature can be disabled in situations where the user
// elects to perform their own rendering.
// <script data-wica-no-css-load src="wica/wica.js" type="module"></script>
const noCss = thisScriptEle.hasAttribute("data-wica-no-css-load");
log.info( "The wica disable CSS load feature has been set to ", noCss );

// Configure whether to suppress automatic rendering of the text content of wica channel html elements.
// <script data-wica-no-text-rendering src="wica/wica.js" type="module"></script>
const noRender = thisScriptEle.hasAttribute( "data-wica-no-text-renderering" );
log.info( "The wica disable document text rendering feature has been set to ", noRender );

// Configure the URL of the stream server that will be targeted by this library.
// This can be overridden externally by loading the wica library with an HTML
// script tag that looks as follows:
// <script data-wica-stream-server-url="https://gfa-wica.psi.ch" src="wica/wica.js" type="module"></script>
const WICA_OWN_HOST = location.origin;
const streamServerUrl = thisScriptEle.hasAttribute( "data-wica-stream-server-url" ) ?
    thisScriptEle.getAttribute("data-wica-stream-server-url" ) : WICA_OWN_HOST;
log.info( "The wica library will communicate with the wica stream server at the following URL: ", streamServerUrl );

// Configure whether to completely suppress loading of the wica document support.
// <script data-wica-no-auto-activate src="wica/wica.js" type="module"></script>
const noAutoload = thisScriptEle.hasAttribute( "data-wica-no-autoload" );
log.info( "The wica disable document support autoload feature has been set to ", noAutoload );

// Attach a handler that to shut things down when the browser navigates away.
let documentSupportLoader = undefined;
window.onbeforeunload = () => {
    log.info( "Wica is shutting down support for the current document..." );

    if ( documentSupportLoader !== undefined ) {
        documentSupportLoader.shutdown();
    }
    log.info( "Wica document support shutdown OK." );
};

// If the auto-activation feature is enabled create and activate a new document
// support loader instance based on the supplied feature options.
if ( ! noAutoload )
{
    documentSupportLoader = new DocumentSupportLoader( streamServerUrl, ! noCss, ! noRender );
    documentSupportLoader.activate(200, 200);
}


// Provide a hook for starting / restarting wica support of the current document
/**
 * Starts or restarts wica support for the current document
 *
 * @param textRendererRefreshRate the rate at which the text renderer will scan and update
 *        the text content of wica channel elements.
 *
 * @param eventManagerRefreshRate the rate at which the wica event manager will notify
 *        the arrival of new stream content.
 */
function restartDocumentSupportLoader( textRendererRefreshRate = 200, eventManagerRefreshRate= 200 )
{
    log.info( "Wica is starting/restarting support for the current document..." );

    // If a document support loader instance already exists then shut it down.
    if ( documentSupportLoader !== null )
    {
        console.log( "Wica is shutting down the previous document support loader instance..." );
        documentSupportLoader.shutdown();
        console.log( "Wica document support loader instance was shutdown OK." );
    }

    // Create a new document support loader instance based on the previously
    // configured feature options.
    console.log( "Wica is creating a new document support loader..." );
    documentSupportLoader = new DocumentSupportLoader( streamServerUrl, ! noCss, ! noRender );
    console.log( "Wica document support loader was created OK." );

    console.log( "Wica is activating the new document support loader..." );
    documentSupportLoader.activate( textRendererRefreshRate, eventManagerRefreshRate );
    log.info( "Wica document support loader was activated OK." );
}

// Install the hook at a place where it is easily reachable
document.wicaRestartDocumentSupportLoader = restartDocumentSupportLoader;

log.info( "Wica support loaded OK. ");
