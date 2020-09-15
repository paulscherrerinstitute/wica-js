# Overview [![Build Status](https://travis-ci.com/paulscherrerinstitute/wica-js.svg?branch=master)](https://travis-ci.com/paulscherrerinstitute/wica-js) [![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/paulscherrerinstitute/wica-js?color=limegreen&label=release)](https://github.com/paulscherrerinstitute/wica-js/releases) [![Docker Image Version (latest semver)](https://img.shields.io/docker/v/paulscherrerinstitute/wica-js?label=dockerhub)](https://hub.docker.com/r/paulscherrerinstitute/wica-js)

This is the **Wica-JS** git repository, one component of PSI's WICA software suite. 
 
WICA stands for *Web Interface for Controls Applications*. The basic idea is to support the streaming of live data 
from a distributed control system to update a user's web pages in real-time.

Wica comprises two main components:

* [Wica-HTTP](https://github.com/paulscherrerinstitute/wica-http) - this is a backend HTTP server which 
  receives incoming requests from the web and which generates live data streams containing information 
  for the control system points of interest.

* [Wica-JS](https://github.com/paulscherrerinstitute/wica-js) - this is a frontend Javascript library 
  which scans a user's [web page](#a-simple-wica-webpage-example) for HTML5 tags defining points of interest 
  in the control system. The library then generates requests to the backend server to obtain the necessary 
  data and to update the user's web pages in real-time. 

Further details about how these components interoperate is provided in the [how it works](#how-it-works) documentation.

# Main Features

* Collaborates with Wica-HTTP backend server to stream control system data to update user web pages.
* Supports configuration of streaming options including backend data acquisition modes (poll or monitor) and channel 
filtering (eg noise or rate limiting).
* Supports all modern web browsers including Chrome, Firefox, Safari and Edge.
* Supports all current web platforms including desktop, tablet and mobile.
* Supports HTML element text rendering (including visualisation of alarm and connection status).
* Supports JS event generation to enable custom calculations or rendering.
* Implemented as Javascript ES6-module with few external dependencies.
* Tooling and dependency management handled by Node.Js/NPM. 

Works out-of-the-box: no complicated build chain (currently no build chain at all).

# Installation

The Wica-JS library release consists of the following files:

| File          | Description           | 
|---------------|-----------------------| 
| wica.js       | Provides an ES6 module for loading directly into wica-aware HTML web pages. | 
| wica.css      | Provides CSS definitions for styling wica-aware HTML elements.  Loaded automatically.  |
| about.html    | Provides release information.  | 
| client-api.js | Provides a standalone API for leveraging the library's functionality directly from JS applications. | 

These files are downloaded from the GitHub release area and bundled automatically into each build of the 
[Wica-HTTP](https://github.com/paulscherrerinstitute/wica-http) server.

Note: in standalone Wica deployment configurations **there is no need** to obtain the Wica-JS library separately
since the release files may be obtained from the Wica-HTTP server's **'/wica'** endpoint. See the 
Wica-HTTP [Server Endpoints](https://github.com/paulscherrerinstitute/wica-http/blob/master/README.md#server-endpoints) 
documentation for further information.

# Runtime Requirements

   * Requires web browser that supports Javascript ES6. See [here](https://caniuse.com/#search=ES6)
     for latest browser compatibility information.
   * Requires web browser which support Server-Sent-Events (SSE), also known as *EventSource* support. See 
     [here](https://caniuse.com/#feat=eventsource) for latest browser compatibility information.
   * Has an internal dependence on the [JSON 5 library](https://json5.org) (which comes bundled with the library).
 
# A Simple Wica Webpage Example

The simplest Wica web page looks like this:
```
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8"/>
   <title>My Awesome Epics Channel Viewer</title>
   <script src="/wica/wica.js" type="module"></script>
</head>

<body>
   <div data-wica-channel-name="abc:def"></div>
</body>

</html>
```
In this example a single channel named "abc:def" is being monitored. When the page is loaded the div element's 
*text content* will be dynamically updated with the latest values obtained from the wica server.  The div 
element's *style* will be dynamically updated to reflect the state of the connection to the channel's data 
source and/or the channel's alarm state.

# How it Works

The Wica-JS library code is executed immediately after the rest of the web page has been loaded. 

It communicates with the Wica-HTTP server to set up one or more data streams containing the evolving values of points
of interest in the backend control system. Using the received data the library updates the user's web page in real-time.

The communication sequence is as shown below:

![Sequence](https://tinyurl.com/y29abfca)

The main steps are as follows:

1.  The **Wica-JS Library** scans the document from which it was loaded for the presence of HTML elements whose
**'data-wica-stream-name'** attribute is specified.  This attribute determines the names of the streams to be
created in collaboration with the **Wica HTTP Server**. If no such elements are discovered a single stream - named
**'default'** - will be created and associated with the document's root element. 

1. For each **'data-wica-stream-name'** element, the library checks for the presence of a corresponding
**'data-wica-stream-props'** attribute. This attribute can be used to configure the properties of the stream. 
When not specified the values from the
[WicaStreamPropertyDefaults](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaStreamPropertyDefaults)
are used.

1. For each **'data-wica-stream-name'** element, the library scans the descendant document tree for any contained
elements whose **'data-wica-channel-name'** attribute is specified. This attribute is used to indicate that an element
is *wica-aware*, that's to say that it provides information about a channel to be included in the parent stream.
For each discovered element the library checks for the presence of a corresponding **'data-wica-channel-props'**
attribute. This is used to specify the properties of the channel. When not provided the values from
the [WicaChannelPropertyDefaults](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaChannelPropertyDefaults)
are used.

1. The **Wica-JS Library** sends one or more *create stream* requests to the Wica-HTTP Server using the information
   captured in the previous steps. Each request specifies the names and properties of the wica channels to be included.

1. The **Wica-HTTP Server** processes each create stream request, using the supplied wica channels names and their
associated  properties to initiate communication with control points of interest in the backend control system. For
each request the server returns to the caller an associated *stream-id*.

1. The **Wica-JS Library** sends *subscribe stream* requests to the Wica-HTTP Server using the received stream-ids.

1. The **Wica-HTTP Server** processes each request and sends back a response indicating that it will hold open the 
HTTP connection and return a stream of Server-Sent-Event (SSE) messages. Thereafter, it sends back SSE messages of 
various types at configurable periodic intervals. These include messages which contain:
    * the channel *metadata* (these are the properties that rarely change), 
    * the channel *received values* (including both the *monitored* and *polled* channels).
    * the stream's *heartbeat* (a timestamp which indicates that the stream is still alive). 

1. The **Wica JS Library** uses the information received from the SSE message streams to update the wica-aware HTML 
elements as follows:
    * it adds/updates the elements' [custom data attributes](#attributes-set-by-the-wica-js-library). 
    * it updates the elements' **text content**. The rendering can be controlled by the **'data-wica-rendering-props'** 
    attribute.
    * it **generates events** which can be hooked by the user's web page to perform *custom javascript processing*.

# Wica-specific HTML Element Attributes

The HTML specification supports the concept of customisable **data-\* attributes** which provides a standard extension
mechanism for associating user-defined information with standard HTML elements. The Wica-JS library leverages of this
functionality to support the wica-specific attributes described further in this
section.

## Attributes Set by the Wica Webpage Developer

### Wica Stream Configuration Attributes

This feature is supported since Wica-JS release **1.3.0**.

The following optional attributes provide the information needed to configure the wica streams that will be created
to obtain the information for the webpage.

Note: 'data-wica-stream-props' attribute is only evaluated on HTML elements that have the 'data-wica-stream-name' 
attribute explicitly configured.

| Attribute                   |Description                                                                                                   | Default    |Possible Values                |  
|-----------------------------|--------------------------------------------------------------------------------------------------------------|------------|-------------------------------| 
| 'data-wica-stream-name'     |The name of the stream that will be created to obtain the information for all nested wica channel elements.   | "default"  | Must be non-blank. Must be unique. Examples: "stream1", "stream2"  | 
| 'data-wica-stream-props'    |The properties of the stream that will be created for all nested wica channel elements.                       | See [WicaStreamPropertyDefaults](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaChannelPropertyDefaults) | See [WicaStreamProperties](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaStreamProperties) | 


### Wica Channel Configuration Attributes

The following attributes provide the information needed to configure the channels within each wica stream.

| Attribute                   |Description                                                                    | Default                 | Possible Values                         |  
|-----------------------------|------------------------------------------------------------------------------ |-------------------------|--------------------------------|
| 'data-wica-channel-name'    |The name of the control system data source.                                    | N/A - must be specified | Depends on the underlying control system. Example: MMAC3:STR:2, ca://abc:def  |
| 'data-wica-channel-props'   |The properties to be used when accessing the HTML element's data source.       | See [WicaChannelPropertyDefaults](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaChannelPropertyDefaults) | See [WicaChannelProperties](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaChannelProperties) |
| 'data-wica-rendering-props' |The properties to be used when rendering the HTML element's textual content.   | See [WicaTextRenderingPropertyDefaults](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaTextRenderingPropertyDefaults) | See [WicaTextRenderingProperties](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#.WicaTextRenderingProperties) |
| 'data-wica-tooltip'         |The tooltip to be displayed when the browser's cursor hovers over the element. | When not specified the 'data-wica-channel-name' content will be used. | Example "some useful message." |


## Attributes Set by the Wica-JS Library

These attributes are **continuously updated** by the Wica-JS library to reflect the evolving state of the channels in
the wica stream. 

The attributes are used internally to support the **CSS styling** (for example the background and forerground colors) 
of wica elements.

The attributes are available to the user's web page who may use it to perform **custom javascript processing**.

| Attribute                             |Description                                                             | Possible Values                                    |  
|---------------------------------------|----------------------------------------------------------------------- | -------------------------------------------------- | 
| 'data-wica-stream-state'              |Reflects the state of the connection to the Wica server's data stream.  | "connect-<attempt>", "opened-<id>", "closed-<id>"  |
| 'data-wica-channel-connection-state'  |Reflects the state of the connection to the control system data source. | "connected", "disconnected"                        |
| 'data-wica-channel-metadata'          |Reflects the metadata obtained most recently from the wica channel.     | Format depends on data-source (control system).    |
| 'data-wica-channel-value-array'       |Reflects the most recently obtained values from the wica channel.       | Format depends on data-source (control system).    |
| 'data-wica-channel-value-latest'      |Reflects the latest value obtained from the wica channel.               | Format depends on data-source (ciontrol system).   |
| 'data-wica-channel-alarm-state'       |Reflects the alarm status most recently obtained from the wica channel. | "0", "1", "2", "3"                                 |

See the [WicaElementConnectionAttributes](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#~WicaElementConnectionAttributes) for further information.  


# Wica-specific HTML Event Support

The most performant, lowest-latency technique for receiving programmatic notification of the arrival of new data from 
the wica stream is to attach a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) 
to directly watch the [attributes of interest](#attributes-set-by-the-wica-js-library) described in the section above.

An alternative approach is to take advantage of the Wica-JS library's inbuilt event generation facility described
in this section.

The Wica-JS library periodically scans the current document for wica-aware elements with attached event handlers 
and/or event listeners, firing events to reflect the latest information obtained from the underlying control system.
 
The default scan rate is specified in the Jsdoc
[documentation](https://paulscherrerinstitute.github.io/wica-js/latest/module-document-event-manager-DocumentEventManager.html#activate).

The following events are generated:

## HTML 'onchange' Standard Event Support

Note: this feature is **under review** and in the future may be *deprecated*.

Whilst nowadays the web community somewhat discourages this practise the Wica-JS library supports the HTML
[onchange](https://www.w3schools.com/tags/ev_onchange.asp) event attribute which allows the user's script 
to be directly embedded in the HTML tags inside a web page.

In addition to the fields generally defined in the [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event) 
specification (eg ev.target), the dispatched event object includes the following wica-specific information:

| Attribute             |Type         | Description                                                        |
|-----------------------|-------------|--------------------------------------------------------------------|
| ev.channelName        | JS Object   |Reflects the name of the wica channel associated with the event.    | 
| ev.channelMetadata    | JS Object   |Reflects the metadata obtained most recently from the wica channel. | 
| ev.channelValueArray  | JS Array    |Reflects the most recently obtained values from the wica channel.   |
| ev.channelValueLatest | JS Object   |Reflects the latest value obtained from the wica channel.           | 

#### Example
```
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <!-- Load the Wica library from the local machine -->
    <script src="http://localhost:8080/wica/wica.js" type="module"></script>
</head>

<body>
    <h1>Wica Event Handling Demo Page</h1>
    <div data-wica-channel-name="wica:test:counter01" onchange="logLatestValue( event )"></div>

    <script>
        function logLatestValue( event )  {
            const widget = event.target;
            const value = event.channelValueLatest.val;
            console.log( "Received latest value: " + value );
        }
    </script>

</body>
</html>
```

## HTML 'wica' Custom Event Support

Note: This feature is the **newer, recommended way** of doing things.

The Wica-JS library supports the HTML [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) 
feature which allows a user's script to programmatically hook on to user-defined events generated on the HTML 
elements in a user's web page. 

The name of the custom event is **'wica'**. The wica-specific information is included in the 'detail' field of 
the message.

See the [OnWicaEvent](https://paulscherrerinstitute.github.io/wica-js/latest/module-document-event-manager.html#.OnWicaEvent)
documentation for further details.
  
# Library Versioning

The release names for this project follow the [semantic versioning](https://semver.org/) naming convention
proposed on the GitHub site.
      
Examples: wica-js-1.0.0, wica-js-1.1.0, wica-js-1.2.3-rc1, wica-js-1.2.3-rc2, wica-js-7.1.5-rc19

# Wica-JS API Documentation

The API documentation for the **latest development** release is always available [here](https://paulscherrerinstitute.github.io/wica-js/latest).

The API documentation for **previous releases** can be found as follows:
```
https://paulscherrerinstitute.github.io/wica-js/<rel>
```
(See the [GitHub Release Area](https://github.com/paulscherrerinstitute/wica-js/releases) to find which releases are
available).

# Project Changes and Tagged Releases

* Project Releases are available in the [GitHub Release Area](https://github.com/paulscherrerinstitute/wica-js/releases) 
and on [Docker Hub](https://cloud.docker.com/u/paulscherrerinstitute/repository/docker/paulscherrerinstitute/wica-js) .

* See the [CHANGELOG](CHANGELOG.md) file for further information.
* See also the project's [Issue Board](https://github.com/paulscherrerinstitute/wica-js/issues).

# Developer 

See the [Developer](DEVELOPER.md) document.

# Contact

If you have questions please contact: 'simon.rees@psi.ch'.

