/**
 * Provides an API for leveraging Wica functionality from the Javascript client side.
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"

import {PlotBuffer} from "./plot-buffer.js";
import {StreamManager} from "./stream-manager.js";
import {DocumentSupportLoader} from "./document-support-loader.js";

export {
    /**
     * Class providing a facility for buffering the received information from one
     * or more wica-aware elements, subsequently making it available to third-parties
     * who may wish to poll for it.
     * See {@link module:plot-buffer~PlotBuffer PlotBuffer}.
     */
    PlotBuffer,
}

export {
    /**
     * Class providing support for creating a new WicaStream on the Wica server, for
     * subscribing to it and for publishing locally the received information.
     * See {@link module:stream-manager~StreamManager StreamManager}.
     */
    StreamManager,
}

export {
    /**
     * Class providing all the functionality necessary to support a wica-aware html page.
     * See {@link module:document-support-loader~DocumentSupportLoader DocumentSupportLoader}.
     */
    DocumentSupportLoader
}

/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in client-api.js module...");
