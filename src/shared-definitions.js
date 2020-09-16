/**
 * Provides definitions that are shared throughout the application.
 * @module
 */

/*- Import/Export Declarations -----------------------------------------------*/

import * as log from "./logger.js"

export { WicaElementEventAttributes,
         WicaElementConnectionAttributes,
         WicaElementTextRenderingAttributes,
         WicaTextRenderingPropertyDefaults,
         WicaStreamPropertyDefaults,
         WicaChannelPropertyDefaults }


/*- Script Execution Starts Here ---------------------------------------------*/

log.log( "Executing script in shared-definitions.js module...");

/*---------------------------------------------------------------------------*/
/* 1.0 SHARED TYPEDEFS                                                       */
/*---------------------------------------------------------------------------*/

/**
 * Provides a type definition for a JS string which defines the name of a channel.
 *
 * @typedef module:shared-definitions.WicaChannelName
 */

/**
 * Provides a union type definition for the filtering possibilities that may be configured on a wica channel.
 *
 * See {@link module:shared-definitions.WicaChannelFilterTypeAllValueSampler WicaChannelFilterTypeAllValueSampler},
 *     {@link module:shared-definitions.WicaChannelFilterTypeLatestValueSampler WicaChannelFilterTypeLatestValueSampler},
 *     {@link module:shared-definitions.WicaChannelFilterTypeFixedCycleSampler WicaChannelFilterTypeFixedCycleSampler},
 *     {@link module:shared-definitions.WicaChannelFilterTypeRateLimitingSampler WicaChannelFilterTypeRateLimitingSampler},
 *     and {@link module:shared-definitions.WicaChannelFilterTypeChangeFilteringSampler WicaChannelFilterTypeChangeFilteringSampler}.
 *
 * @typedef module:shared-definitions.WicaChannelFilterType
 */

/**
 * Provides a type definition for a filter that "does nothing", passing through all values obtained from the
 * channel's data source.
 *
 * @typedef module:shared-definitions.WicaChannelFilterTypeAllValueSampler
 * @property {string} filter - "all-value" - the string literal that configures this type of filter.
 */

/**
 * Provides a type definition for a filter that passes through only the latest values received from the
 * channel during the wica server's previous value update sampling time window.
 *
 * @typedef module:shared-definitions.WicaChannelFilterTypeLatestValueSampler
 * @property {string} filter - "last-n" - the string literal that configures this type of filter.
 * @property {number} n - The maximum number of values to pass through the filter on each update cycle.
 */

/**
 * Provides a type definition for a filter that passes through values obtained from the channel's data source
 * on a fixed one-in-N sampling basis.
 *
 * @typedef module:shared-definitions.WicaChannelFilterTypeFixedCycleSampler
 * @property {string} filter - "one-in-m" - the string literal that configures this type of filter.
 * @property {number} m - The sampling cycle length.
 */

/**
 * Provides a type definition for a filter that passes through values obtained from the channel's data source based
 * on a minimum time interval between successive samples.
 *
 * @typedef module:shared-definitions.WicaChannelFilterTypeRateLimitingSampler
 * @property {string} filter - "rate-limiter" - the string literal that configures this type of filter.
 * @property {number} interval - The minimum time duration between samples in milliseconds.
 */

/**
 *  Provides a type definition for a filter that that passes through values every time the input signal makes a
 *  transition whose absolute value exceeds the configured deadband. The filter operates only on channels whose
 *  underlying type is numeric; the information for all other channel types passes through unchanged.
 *
 * @typedef module:shared-definitions.WicaChannelFilterTypeChangeFilteringSampler
 * @property {string} filter - "changes" - the string literal that configures this type of filter.
 * @property {number} deadband - Defines the absolute change which must occur in the input value in order for
 *     the new value to be passed through the filter.
 */

/**
 * Provides a type definition for a union type which describes the metadata information associated with a wica channel.
 *
 * See {@link module:shared-definitions.WicaChannelMetadataOther WicaChannelMetadataOther},
 * and {@link module:shared-definitions.WicaChannelMetadataEpics WicaChannelMetadataEpics}.
 *
 * @typedef module:shared-definitions.WicaChannelMetadata
 */

/**
 * Provides a type definition to describe the metadata associated with a channel based on a data source with
 * minimal additional information.
 *
 * @typedef module:shared-definitions.WicaChannelMetadataOther
 * @property type {string} - One of: "REAL", "INTEGER", "STRING", "REAL_ARRAY", "INTEGER_ARRAY", "STRING_ARRAY".
 *     This property is always present.
 */

/**
 * Provides a type definition to describe the metadata associated with a channel based on an EPICS data source.
 *
 * The published properties may vary according to the EPICS record that publishes the EPICS channel. A combination
 * of any or all of the following properties is possible.
 *
 * @typedef module:shared-definitions.WicaChannelMetadataEpics
 * @property type {string} - One of: "REAL", "INTEGER", "STRING", "REAL_ARRAY", "INTEGER_ARRAY", "STRING_ARRAY".
 * @property egu  {string} -  Engineering Units in which the channel's value will be expressed.
 * @property prec {number} - The precision in which the channel's value will be expressed. Applies only to numeric types.
 * @property hopr {number} - High Operating Range.
 * @property lopr {number} - Low Operating Range.
 * @property drvh {number} - Drive High Control Limit.
 * @property drvl {number} - Drive Low Control Limit.
 * @property hihi {number} - Upper Alarm Limit.
 * @property lolo {number} - Lower Alarm Limit.
 * @property high {number} - Upper Warning Limit.
 * @property low  {number} - Lower Warning Limit.
 */


/**
 * Provides a type definition for a JS Object that specifies the instantaneous value of a Wica Channel.
 *
 * The value information includes the raw channel value, the timestamp at which the value was obtained, and the
 * channel alarm status.
 *
 * @typedef module:shared-definitions.WicaChannelValue
 *
 * @property val {string|null} - JSON String representation of the current value. Set to NULL if the channel's
 *     data source is offline, or otherwise unavailable.
 *
 * @property sevr {number} - [Alarm Severity] -  Present if the WicaStreamProperty 'includeAlarmInfo' is true. The
 *    following values are defined (0 = No Alarm; 1 = Minor Alarm, 2 = Major Alarm)
 *
 * @property ts {string} - [Timestamp] - present if the WicaStreamProperty 'includeTimestamp' is true.
 */


/**
 * Provides a type definition for a JS Object that defines the HTML element attributes used by the
 * {@link module:document-event-manager.DocumentEventManager DocumentEventManager} in its mission to
 * fire events on wica channel elements.
 *
 * @typedef module:shared-definitions.WicaElementEventAttributes
 *
 * @property {string} [eventHandler] - The name of the attribute which will be examined to look for a
 *    wica custom event handler.
 */

/**
 * Provides a type definition for a JS Object that defines the HTML element attributes used by the
 * {@link module:document-stream-connector.DocumentStreamConnector DocumentStreamConnector} when communicating
 * with the Wica server.
 *
 * @typedef module:shared-definitions.WicaElementConnectionAttributes
 *
 * @property {string} streamName - The name of the element attribute which specifies the wica stream name.
 *    Format: JS string literal.
 *
 * @property {string} streamProperties - The name of the element attribute which
 *     specifies the wica stream properties. Format: JSON string literal, representing JS
 *     {@link module:shared-definitions.WicaStreamProperties WicaStreamProperties} object.
 *
 * @property {string} streamState - The name of the element attribute which reflects
 *     the state of the connection to the wica server's data stream. Format: JS string literal with possible
 *     values: [ "connect-CCC", "opened-XXX", "closed-XXX" ], where CCC represents the incrementing connection
 *     request counter and XXX the id of the last stream that was opened.
 *
 * @property {string} channelName - The name of the element attribute which specifies the wica channel name.
 *     This is the minimum information that must be present for an element to be considered a wica channel.
 *     Format: JS string literal.
 *
 * @property {string} channelProperties - The name of the element attribute which specifies the wica channel
 *     properties. Format: JSON string literal, representing JS
 *     {@link module:shared-definitions.WicaChannelProperties WicaChannelProperties} object.
 *
 * @property {string} channelConnectionState - The name of the element attribute which reflects the state of
 *     the connection between the wica server and the wica channel's data source. Format: JS string literal
 *     with possible values: ["connecting-N", "opened-X", "closed-X"], where N represents the incrementing
 *     count of connection attempts and X represents the stream ID assigned by the server.
 *
 * @property {string} channelMetadata - The name of the element attribute which reflects the metadata obtained
 *     most recently from the wica channel. Format: JSON string literal, representing
 *     JS {@link module:shared-definitions.WicaChannelMetadata WicaChannelMetadata} object.
 *
 * @property {string} channelValueArray - The name of the attribute which reflects the most recently obtained
 *     values from the wica channel. Format: JSON string literal, representing JS Array
 *     of {@link module:shared-definitions.WicaChannelValue WicaChannelValue} objects.
 *
 * @property {string} channelValueLatest - The name of the attribute which is set to reflect the last value
 *     obtained from the channel. Format: JSON string literal, representing JS
 *     {@link module:shared-definitions.WicaChannelValue WicaChannelValue} object.
 *
 * @property {string} channelAlarmState - The name of the attribute which reflects the alarm status most
 *     recently obtained from the channel. Format: JS number literal with possible values:
 *     [ 0 (= "NO_ALARM"), 1 (= "MINOR_ALARM"), 2 (= "MAJOR_ALARM"), 3 (= "INVALID_ALARM") ].
 */

/**
 * Provides a type definition for a JS Object that defines the HTML element attributes used by the
 * {@link module:document-text-renderer.DocumentTextRenderer DocumentTextRenderer} when rendering the
 * element's visual state.
 *
 * @typedef module:shared-definitions.WicaElementTextRenderingAttributes
 *
 * @property {string} tooltip - The name of the attribute which specifies the tooltip to be displayed
 *     when the browser's cursor hovers over the element. When not explicitly set by the developer
 *     the wica channel name will be assigned to this attribute instead. Format: JS string literal.
 *
 * @property {string} renderingProperties - The name of the attribute which provides other miscellaneous
 *     properties which affect the way the element is rendered. Format: JSON string literal
 *     representing JS {@link module:shared-definitions.WicaRenderingProperties WicaRenderingProperties}
 *     object.
 */

/**
 * Provides a type definition for a JS Object that specifies the properties to be used when rendering
 * a Wica element's textual content.
 *
 * When not specified the property values will be taken from the
 * {@link module:shared-definitions.WicaTextRenderingPropertyDefaults WicaTextRenderingPropertyDefaults}.
 *
 * @typedef module:shared-definitions.WicaTextRenderingProperties
 *
 * @property {boolean} [disable] - Disables rendering for this channel.
 * @property {string} [units] - The units to be displayed when rendering numeric information. When this
 *     property is specified it will be used. When not specified an attempt will be made to obtain the units
 *     from the metadata.
 * @property {boolean} [exp] - Sets the rendering format for channels which return numeric data. Possible
 *     values: [true (use exponential format, eg 1.27E-1), false (use fixed decimal point format, eg 0.127)].
 * @property {number} [prec] - The precision (= number of digits after the decimal point) to be used for
 *     channels which return numeric data.
 */

/**
 * Provides a type definition for a JS Object that specifies the properties of a Wica Stream.
 *
 * When not specified the property values will be taken from the
 * {@link module:shared-definitions.WicaStreamPropertyDefaults WicaStreamPropertyDefaults}.
 *
 * @typedef module:shared-definitions.WicaStreamProperties
 *
 * @property {number} [hbflux] - The interval in milliseconds between heartbeat messages.
 * @property {number} [metaflux] - The interval in milliseconds between transmitting successive
 *    Server-Sent-Event (SSE) messages with the latest wica channel metadata.
 * @property {number} [monflux] - The interval in milliseconds between transmitting successive
 *    Server-Sent-Event (SSE) messages with the latest wica channel monitored values.
 * @property {number} [pollflux] - The interval in milliseconds between transmitting successive
 *    Server-Sent-Event (SSE) messages with the latest wica channel polled values.
 * @property {string} [daqmode] - The default data acquisition mode.
 * @property {number} [pollint] - The default polling interval in milliseconds.
 * @property {number} [prec] - The precision (= number of digits after the decimal point) to be used when
 *     sending numeric information.
 * @property {string} [fields] - A semicolon delimited list defining the data fields that
 *    should be included by default in the stream of WicaChannelValues.
 */

/**
 * Provides a type definition for a JS Object that specifies the properties of a Wica Channel.
 *
 * When not specified the property values will be taken from the
 * {@link module:shared-definitions.WicaChannelPropertyDefaults WicaChannelPropertyDefaults}.
 *
 * @typedef module:shared-definitions.WicaChannelProperties
 *
 * @property {string|null} [daqmode] - The data acquisition mode.
 *
 * @property {number|null} [pollint] - The interval between successive polls of the channel value.
 *
 * @property {string|null} [fields] - A semicolon delimited list defining the data fields that
 *    should be included when sending value information for this channel.
 *
 * @property {number|null} [prec] - The precision (= number of digits after the decimal point) to be
 *     used when sending numeric information.
 *
 * @property {module:shared-definitions.WicaChannelFilterType} [filter] - The type of filtering to be used on the channel.
 *     See {@link module:shared-definitions.WicaChannelFilterType WicaChannelFilterType}.
 *
 * @property {number} [n] - The filter number of samples.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeLatestValueSampler WicaChannelFilterTypeLatestValueSampler}.
 *
 * @property {number} [m] - The filter cycle length.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeFixedCycleSampler WicaChannelFilterTypeFixedCycleSampler}.
 *
 * @property {number} [interval] - The filter sampling interval.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeRateLimitingSampler WicaChannelFilterTypeRateLimitingSampler}.
 *
 * @property {number} [deadband] - The filter deadband.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeChangeFilteringSampler WicaChannelFilterTypeChangeFilteringSampler}.
 */

/*---------------------------------------------------------------------------*/
/* 2.0 SHARED OBJECT LITERALS                                                */
/*---------------------------------------------------------------------------*/

/**
 * JS Object that defines the HTML element attributes used by the
 * {@link module:document-event-manager.DocumentEventManager DocumentEventManager} in its mission to fire
 * events on wica-aware elements.
 *
 * @type {module:shared-definitions.WicaElementEventAttributes}
 *
 * @property {string} eventHandler="onchange" - The name of the attribute which will be examined to look for a
 *    wica custom event handler.
 *
 * @static
 */
const WicaElementEventAttributes = Object.freeze ({
    eventHandler: "onchange"
} );

/**
 * JS Object that defines the HTML element attributes used by the
 * {@link module:document-stream-connector.DocumentStreamConnector DocumentStreamConnector} when communicating
 * with the Wica server.
 *
 * @type {module:shared-definitions.WicaElementConnectionAttributes}
 *
 * @property {string} streamName="data-wica-stream-name" - The name of the element attribute which specifies
 *     the wica stream name. Format: JS string literal.

 * @property {string} streamProperties="data-wica-stream-properties" - The name of the element attribute which
 *     specifies the wica stream properties. Format: JSON string literal, representing JS
 *     {@link module:shared-definitions.WicaStreamProperties WicaStreamProperties} object.
 *
 * @property {string} streamState="data-wica-stream-state" - The name of the element attribute which reflects
 *     the state of the connection to the wica server's data stream. Format: JS string literal with possible
 *     values: [ "connect-CCC", "opened-XXX", "closed-XXX" ], where CCC represents the incrementing connection
 *     request counter and XXX the id of the last stream that was opened.
 *
 * @property {string} channelName="data-wica-channel-name" - The name of the element attribute which specifies
 *     the wica channel name. This is the minimum information that must be present for an element to be
 *     considered "wica-aware". Format: JS string literal.
 *
 * @property {string} channelProperties="data-wica-channel-properties" - The name of the element attribute which
 *     specifies the wica channel properties. Format: JSON string literal, representing JS
 *     {@link module:shared-definitions.WicaChannelProperties WicaChannelProperties} object.
 *
 * @property {string} channelConnectionState="data-wica-channel-connection-state" - The name of the element
 *     attribute which reflects the state of the connection between the wica server and the wica
 *     channel's data source. Format: JS string literal with possible values: ["connecting-N", "opened-X",
 *     "closed-X"], where N represents the incrementing count of connection attempts and X represents the
 *     stream ID assigned by the server.
 *
 * @property {string} channelMetadata="data-wica-channel-metadata" - The name of the element attribute which
 *     reflects the metadata obtained most recently from the wica channel. Format: JSON string literal,
 *     representing JS {@link module:shared-definitions.WicaChannelMetadata WicaChannelMetadata} object.
 *
 * @property {string} channelValueArray="data-wica-channel-value-array" - The name of the attribute which
 *     reflects the most recently obtained values from the wica channel. Format: JSON string literal,
 *     representing JS Array of {@link module:shared-definitions.WicaChannelValue WicaChannelValue} objects.
 *
 * @property {string} channelValueLatest="data-wica-channel-value-latest" - The name of the attribute which is
 *     set to reflect the last value obtained from the channel. Format: JSON string literal, representing JS
 *     {@link module:shared-definitions.WicaChannelValue WicaChannelValue} object.
 *
 * @property {string} channelAlarmState="data-wica-channel-alarm-state" - The name of the attribute which reflects
 *     the alarm status most recently obtained from the channel. Format: JS number literal with possible values:
 *     [ 0 (= "NO_ALARM"), 1 (= "MINOR_ALARM"), 2 (= "MAJOR_ALARM"), 3 (= "INVALID_ALARM") ].
 *
 * @static
 */
const WicaElementConnectionAttributes = Object.freeze ({
    streamName:             "data-wica-stream-name",
    streamProperties:       "data-wica-stream-props",
    streamState:            "data-wica-stream-state",
    channelName:            "data-wica-channel-name",
    channelProperties:      "data-wica-channel-props",
    channelConnectionState: "data-wica-channel-connection-state",
    channelMetadata:        "data-wica-channel-metadata",
    channelValueArray:      "data-wica-channel-value-array",
    channelValueLatest:     "data-wica-channel-value-latest",
    channelAlarmState:      "data-wica-channel-alarm-state"
} );

/**
 * JS Object that defines the HTML element attributes used by the
 * {@link module:document-text-renderer.DocumentTextRenderer DocumentTextRenderer} when rendering the element's
 * visual state.
 *
 * @type {module:shared-definitions.WicaElementTextRenderingAttributes}
 *
 * @property {string} tooltip="data-wica-tooltip" - The name of the attribute which specifies the tooltip to
 *     be displayed when the browser's cursor hovers over the element. When not explicitly set by the developer
 *     the wica channel name will be assigned to this attribute instead. Format: JS string literal.
 *
 * @property {string} renderingProperties="data-wica-rendering-props" - The name of the attribute which provides
 *     other miscellaneous properties which affect the way the element is rendered. Format: JSON string literal
 *     representing JS {@link module:shared-definitions.WicaRenderingProperties WicaRenderingProperties}
 *     object.
 *
 * @static
 */
const WicaElementTextRenderingAttributes = Object.freeze ({
    tooltip:             "data-wica-tooltip",
    renderingProperties: "data-wica-rendering-props"
} );

/**
 * JS Object that defines the default values for the properties of the Wica Text Renderer.
 *
 * @type {module:shared-definitions.WicaTextRenderingProperties}
 *
 * @property {boolean} WicaTextRenderingProperties.disable=false - Disables rendering for this channel.
 * @property {string} WicaTextRenderingProperties.units="" - The units to be displayed when rendering numeric information. When this
 *     property is specified it will be used. When not specified an attempt will be made to obtain the units
 *     from the metadata.
 * @property {boolean} WicaTextRenderingProperties.exp=false - Sets the rendering format for channels which return numeric data. Possible
 *     values: [true (use exponential format, eg 1.27E-1), false (use fixed decimal point format, eg 0.127)].
 * @property {number} WicaTextRenderingProperties.prec=8 - The precision (= number of digits after the decimal point) to be used for
 *     channels which return numeric data.
 *
 * @static
 */
const WicaTextRenderingPropertyDefaults = Object.freeze ({
    disable: false,
    exp: false,
    prec: 8,
    units: ""
} );

/**
 * JS Object that defines the default values for the properties of a Wica Stream.
 *
 * @type {module:shared-definitions.WicaStreamProperties}
 *
 * @property {number} WicaStreamProperties.hbflux=15000 - The interval in milliseconds between heartbeat messages.
 * @property {number} WicaStreamProperties.metaflux=100 The interval in milliseconds between transmitting successive
 *    Server-Sent-Event (SSE) messages with the latest wica channel metadata.
 * @property {number} WicaStreamProperties.monflux=200 The interval in milliseconds between transmitting successive
 *    Server-Sent-Event (SSE) messages with the latest wica channel monitored values.
 * @property {number} WicaStreamProperties.pollflux=1000 The interval in milliseconds between transmitting successive
 *    Server-Sent-Event (SSE) messages with the latest wica channel polled values.
 * @property {string} WicaStreamProperties.daqmode=monitor - The default data acquisition mode.
 * @property {number} WicaStreamProperties.pollint=1000 - The default polling interval in milliseconds.
 * @property {number} WicaStreamProperties.prec=3 - The precision (= number of digits after the decimal point) to be used when
 *     sending numeric information.
 * @property {string} WicaStreamProperties.fields=val;sevr - A semicolon delimited list defining the data fields that
 *    should be included by default in the stream of WicaChannelValues.
 *
 * @static
 */
const WicaStreamPropertyDefaults = Object.freeze ({
    hbflux: 15000,
    metaflux: 100,
    monflux: 200,
    pollflux: 1000,
    daqmode: "monitor",
    pollint: 1000,
    prec: 3,
    fields: "val;sevr",
} );

/**
 * JS Object that defines the default values for the properties of a Wica Channel.
 *
 * @type {module:shared-definitions.WicaChannelProperties}
 *
 * @property {string} WicaChannelProperties.daqmode=(=stream-property-default) - The data acquisition mode.
 *
 * @property {number} WicaChannelProperties.pollint=(=stream-property-default) - The interval between successive polls
 *     of the channel value.
 *
 * @property {string} WicaChannelProperties.fields=(=stream-property-default) - A semicolon delimited list defining
 *     the data fields that should be included when sending the value information for this channel.
 *
 * @property {number} WicaChannelProperties.prec=(=stream-property-default) - The precision (= number of digits after
 *     the decimal point) to be used when sending the numeric information for this channel.
 *
 * @property {module:shared-definitions.WicaChannelFilterType} WicaChannelProperties.filter="last-n" - The type of filtering to be used on the channel. See
 *     {@link module:shared-definitions.WicaChannelFilterType WicaChannelFilterType}.
 *
 * @property {number} WicaChannelProperties.n=1 - The filter number of samples.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeLatestValueSampler WicaChannelFilterTypeLatestValueSampler}.
 *
 * @property {number} WicaChannelProperties.m=1 - The filter cycle length.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeFixedCycleSampler WicaChannelFilterTypeFixedCycleSampler}.
 *
 * @property {number} WicaChannelProperties.interval=1 - The filter sampling interval.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeRateLimitingSampler WicaChannelFilterTypeRateLimitingSampler}.
 *
 * @property {number} WicaChannelProperties.deadband=1.0 - The filter deadband.
 *     See {@link module:shared-definitions.WicaChannelFilterTypeChangeFilteringSampler WicaChannelFilterTypeChangeFilteringSampler}.
 *
 * @static
 */
const WicaChannelPropertyDefaults = Object.freeze ({
    daqmode: null,
    pollint: null,
    fields: null,
    prec: null,
    filter: "last-n",
    n: 1,
    m: 1,
    interval: 1,
    deadband: 1.0
} );
