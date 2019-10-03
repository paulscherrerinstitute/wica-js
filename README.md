# Overview [![Build Status](https://travis-ci.org/paulscherrerinstitute/wica-js.svg?branch=master)](https://travis-ci.org/paulscherrerinstitute/wica-js) 

This is the **Wica-JS** git repository, one component of PSI's WICA software suite. 
 
WICA stands for *Web Interface for Controls Applications*. The basic idea is to support the streaming of live data 
from a distributed control system to update a user's web pages in real-time.

Wica comprises two main components:

* [Wica-HTTP](https://github.com/paulscherrerinstitute/wica-http) - this is a backend HTTP server which 
  receives incoming requests from the web and which generates live data streams containing information 
  for the control system points of interest.

* [Wica-JS](https://github.com/paulscherrerinstitute/wica-js) - this is a frontend Javascript library 
  which scans a user's web pages for HTML5 tags defining points of interest in the control system. The 
  library then generates requests to the backend server to obtain the necessary data and to update the 
  user's web pages in real-time.

Currently WICA interoperates with the EPICS Control Systems using its well established Channel Access (CA) protocol. 

# Main Features

* Collaborates with Wica-HTTP backend server to stream control system data to update user web pages.
* Supports configuration of streaming options including backend data acquisition modes (poll or monitor) and channel 
filtering (eg noise or rate limiting).
* Supports all modern web browsers including Chrome, Firefox, Safari and Edge.
* Supports all current web platforms including desktop, tablet and mobile.
* Supports HTML element text rendering (including visualisation of alarm and connection status).
* Supports JS event generation to enable custom calculations or rendering.
* Implemented as Javascript ES6-module with few external dependencies.
* Works out-of-the-box: no complicated build chain (currently no build chain at all).

# Requirements

   * Requires web browser that supports Javascript ES6. See [here](https://caniuse.com/#search=ES6)
     for latest browser compatibility information.
   * Requires web browser which support Server-Sent-Events (SSE), also known as *EventSource* support. See 
     [here](https://caniuse.com/#feat=eventsource) for latest browser compatibility information.
   * Has an internal dependence on the [JSON 5 library](https://json5.org) 
   
   
# Installation

The release names for this project follow the [semantic versioning](https://semver.org/) naming convention
proposed on the GitHub site.
      
Examples: wica-js-1.0.0, wica-js-1.1.0, wica-js-1.2.3-rc1, wica-js-1.2.3-rc2, wica-js-7.1.5-rc19

The [Wica-JS](https://github.com/paulscherrerinstitute/wica-js) library is downloaded and bundled automatically 
into the build of the [Wica-HTTP](https://github.com/paulscherrerinstitute/wica-http) server. Normally there is 
no need to obtain it separately.

See the Wica-HTTP [endpoints](https://github.com/paulscherrerinstitute/wica-http/blob/master/README.md#server-endpoints) 
documentation for the relevant URL.


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
*text content* will be dynamically updated with the latest values obtained from the wica channel.  The div 
element's *style* will be dynamically updated to reflect the state of the connection to the channel's data 
source and/or the channel's alarm state.

# How it Works

The Wica-JS library code is executed immediately after the rest of the web page has been loaded. 

It communicates with the Wica-HTTP server to set up a stream of data containing the evolving values from points of interest in the backend control system. Using the received data the library updates the user's web page in real-time.

The communication sequence is as shown below:

![Sequence](https://tinyurl.com/y29abfca)

The main steps are as follows:

1.  The **Wica-JS Library** scans the document from which it was loaded for elements whose **'data-wica-channel-name'** 
attribute is set. This attribute is used as the means of indicating that an element is *wica-aware*. 

1. The **Wica-JS Library** sends a *create stream* request to the Wica-HTTP Server. Included in the request are the names 
of the wica channels to be included in the new stream, together with the required *wica channel properties* (whose 
default values may be overridden via the **'data-wica-channel-props'** attribute).

1. The **Wica-HTTP Server** processes the request. It uses the supplied wica channels names and their associated properties to initiate communication with control points of interest in the backend control system. It then allocates and returns
to the caller a new *stream-id*.

1. The **Wica-JS Library** sends a *subscribe stream* request to the Wica-HTTP Server using the received stream-id.

1. The **Wica-HTTP Server** processes the request and sends back a response indicating that it will hold open the HTTP connection and return a stream of Server-Sent-Event (SSE) messages. Thereafter, it sends back SSE messages of various
types at configurable periodic intervals. These include messages which contain:
    * the channel *metadata* (these are the properties that rarely change), 
    * the channel *received values* (including both the *monitored* and *polled* channels).
    * the stream's *heartbeat* (a timestamp which indicates that the stream is still alive). 

1. The **Wica JS Library** uses the information received from the event stream to update the wica-aware HTML elements as follows:
    * it adds/updates the elements' [custom data attributes](#attributes-set-by-the-wica-js-library). 
    * it updates the elements' **text content**. The rendering can be controlled by the **'data-wica-rendering-props'** attribute.
    * it **generates events** which can be hooked by the user's web page to perform *custom javascript processing*.

# Supported HTML Element Attributes

The HTML 5 specification supports the concept of customisable **data-\* attributes** which provides a standard 
mechanism for associating additional, user-defined information with standard HTML elements. 

The Wica-JS library uses this feature to support the custom attributes (with the prefix **data-wica-\***) 
described further in this section.

## Attributes Set by the Web Page Developer

These attributes are read by the Wica-JS library and used primarily for building the configuration data structure
that is sent to the Wica-HTTP server when making requests to create new wica streams. 

Additional attributes are provided to control the rendering of wica web pages.

| Attribute                   |Description                                                                  | Possible Values                         |  
|-----------------------------|---------------------------------------------------------------------------- |-----------------------------------------| 
| 'data-wica-channel-name'    |The name of the control system data source.                                  | Depends on underlying control system.   |
| 'data-wica-channel-props'   |The properties to be used when accessing the HTML element's data source.     | See the [jsDoc](https://paulscherrerinstitute.github.io/wica-js/latest/module-shared-definitions.html#wica-channel-properties) for further information.  |
| 'data-wica-rendering-props' |The properties to be used when rendering the HTML element's textual content. | See the [jsDoc]() for further information.  |


## Attributes Set by the Wica-JS Library

These attributes are continuously updated by the Wica-JS library to reflect the evolving state of the channels in
a wica stream. They are used internally to support the CSS styling of wica elements but are also available 
for the user's web page to perform custom javascript processing.

| Attribute                             |Description                                                             | Possible Values                                    |  
|---------------------------------------|----------------------------------------------------------------------- | -------------------------------------------------- | 
| 'data-wica-stream-state'              |Reflects the state of the connection to the Wica server's data stream.  | "connect-<attempt>", "opened-<id>", "closed-<id>"  |
| 'data-wica-channel-connection-state'  |Reflects the state of the connection to the control system data source. | "connected", "disconnected"                        |
| 'data-wica-channel-metadata'          |Reflects the metadata obtained most recently from the wica channel.     | Format depends on data-source (control system).    |
| 'data-wica-channel-value-array'       |Reflects the most recently obtained values from the wica channel        | Format depends on data-source (control system).    |
| 'data-wica-channel-value-latest'      |Reflects the latest value obtained from the wica channel.               | Format depends on data-source (ciontrol system).   |
| 'data-wica-channel-alarm-state'       |Reflects the alarm status most recently obtained from the wica channel. | "0", "1", "2", "3"                                 |


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

