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

// Configure whether to autoload the default wica CSS file when the JS library is loaded.
// The wica CSS file supports features such as tooltip hover and alarm state colourisation.
// The CSS autoload feature can be disabled in situations where the user elects to perform
// their own rendering.
// <script data-wica-autoload-css=false src="wica/wica.js" type="module"></script>
const autoloadCss = thisScriptEle.hasAttribute( "data-wica-stream-autoload-css" ) ?
    thisScriptEle.getAttribute("data-wica-stream-exclude-css" ) : true;
log.info( "The wica library CSS autoload feature has been set to ", autoloadCss );

// Define the server this application is intended to target.
const WICA_OWN_HOST = location.origin;

// Configure the URL of the stream server that will be targeted by this library.
// This can be overridden externally by loading the wica library with an HTML
// script tag that looks as follows:
// <script data-wica-stream-server-url="https://gfa-wica.psi.ch" src="wica/wica.js" type="module"></script>
const streamServerUrl = thisScriptEle.hasAttribute( "data-wica-stream-server-url" ) ?
    thisScriptEle.getAttribute("data-wica-stream-server-url" ) : WICA_OWN_HOST;
const documentSupportLoader = new DocumentSupportLoader( streamServerUrl, autoloadCss );
log.info( "The wica library will communicate with the wica stream server at the following URL: ", streamServerUrl );

// Create and activate a document support loader for the document which loaded this library.
documentSupportLoader.activate( 200, 200 );

// Attach a handler to shut things down when the browser navigates away.
window.onbeforeunload = () => {
    log.info( "Wica is shutting down support for the current document..." );
    documentSupportLoader.shutdown();
    log.info( "Wica unloaded OK." );
};

// Provide a hook for restarting wica support of the current document
function restartDocumentSupportLoader() {
    log.info( "Wica is restarting support for the current document..." );
    documentSupportLoader.shutdown();
    log.info( "Wica document support loader was shutdown OK." );
    documentSupportLoader.activate( 200, 200 );
    log.info( "Wica document support loader was activated OK." );
}

document.wicaRestartDocumentSupportLoader = restartDocumentSupportLoader;

log.info( "Wica support loaded OK. ");
