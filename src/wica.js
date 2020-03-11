/**
 * Provides the main entry point for supporting a Wica-aware document.
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
// overriden externally by loading the wica library with an HTML script tag
// that looks as follows:
// <script data-wica-log-level= src="wica/wica.js" type="module"></script>
const logLevel = thisScriptEle.hasAttribute( "data-wica-log-level" ) ?
    thisScriptEle.getAttribute("data-wica-log-level" ) :  log.logLevels.DEFAULT;
log.setLevel( logLevel );
log.info( "The configured log level has been set to: ", logLevel );

// Define the server this application is intended to target.
const WICA_OWN_HOST = location.origin;

// Configure the URL of the stream server that will be targeted by this library.
// This can be overriden externally by loading the wica library with an HTML
// script tag that looks as follows:
// <script data-wica-stream-server-url="https://gfa-wica.psi.ch" src="wica/wica.js" type="module"></script>
const streamServerUrl = thisScriptEle.hasAttribute( "data-wica-stream-server-url" ) ?
    thisScriptEle.getAttribute("data-wica-stream-server-url" ) : WICA_OWN_HOST;
const documentSupportLoader = new DocumentSupportLoader( streamServerUrl );
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
