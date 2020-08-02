/**
 * Provides helper functions for wica-aware html pages.
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"
import {WicaElementConnectionAttributes} from './shared-definitions.js';

export { findWicaStreamElements,
         findWicaChannelElements,
    }

/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in document-utils.js module...");

/**
 * Finds all wica-stream-related HTML elements in the current document. That's to say, all elements
 * which include an attribute which defines the name or properties of a stream.
 *
 * @returns {Array<Element>} - The result list.
 */
function findWicaStreamElements()
{
    return findWicaElementsWithAttributeNameAlsoInShadowDom( document, WicaElementConnectionAttributes.streamName );
}

/**
 * Finds all wica-channel-related HTML elements in the current document. That's to say, all elements
 * which include an attribute which defines the name of the wica channel.
 *
 * @param {Element} rootElement - the document element at which to start searching.
 * @returns {Array<Element>} - The result list.
 */
function findWicaChannelElements( rootElement )
{
    return findWicaElementsWithAttributeNameAlsoInShadowDom( rootElement, WicaElementConnectionAttributes.channelName );
}

/**
 * Finds all HTML elements in the current document whose attribute name matches the specified value.
 * Continue search into subtrees that are DOM shadow roots.
 *
 * @param {!ParentNode} parentNode - the node at which to start searching.
 * @param {!string} attributeName - The attribute name to target.
 * @returns {Array<Element>} - The result list.
 */
function findWicaElementsWithAttributeNameAlsoInShadowDom( parentNode, attributeName )
{
    const selector = "[" + attributeName + "]";
    const nodesInParent = parentNode.querySelectorAll( selector );
    let nodesInChildren = [];
    Array.from( parentNode.querySelectorAll('*') )
        .filter( element => element.shadowRoot )
        .forEach( element => {
            const nodesInChild = findWicaElementsWithAttributeNameAlsoInShadowDom( element.shadowRoot, attributeName );
            const nodesInChildAsArray = Array.from( nodesInChild );
            nodesInChildren = nodesInChildren.concat( nodesInChildAsArray );
        });

    return [ ...nodesInParent, ...nodesInChildren ];
}

