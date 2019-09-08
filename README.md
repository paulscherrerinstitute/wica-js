[![Build Status](https://travis-ci.org/paulscherrerinstitute/wica-js.svg?branch=master)](https://travis-ci.org/paulscherrerinstitute/wica-js) 

:construction:
Note: this README is still **under construction** and may contain incorrect or misleading information. 

# Overview

This is the **Wica-JS** Git repository, one component of PSI's WICA software suite. 
 
WICA stands for *Web Interface for Controls Applications*. The basic idea is to support the streaming of live data 
from a distributed control system to update a user's web pages in real-time.
 
Wica comprises two main components:

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

   * Requires web browser that supports Javascript ES6. See [here](https://caniuse.com/#search=ECMAScript%202015%20(ES6)).
   * Requires web browser which support Server-Sent-Events (SSE), also know as [EventSource](https://caniuse.com/#feat=eventsource).
   * Requires [JSON 5 library](https://json5.org) 
   
   
# Installation

The release names for this project follow the  [semantic versioning](https://semver.org/) naming convention
proposed on the GitHub site.
      
Examples: wica-js-1.0.0, wica-js-1.1.0, wica-js-1.2.3.rc1, wica-js-1.2.3.rc2, wica-js-7.1.5.rc19

The [Wica-JS](https://github.com/paulscherrerinstitute/wica-js) library is downloaded and bundled automatically 
into the build of the [Wica-HTTP](https://github.com/paulscherrerinstitute/wica-http) server. Normally there is 
no need to obtain it separately.

See the Wica-HTTP [endpoints](https://github.com/paulscherrerinstitute/wica-http/blob/master/README.md#server-endpoints) 
documentation for the relevant URL.

# Wica-JS API Documentation

The API documentation (ES6doc) is available [here](https://paulscherrerinstitute.github.io/wica-js/)

# Project Changes and Tagged Releases

* See the [CHANGELOG](CHANGELOG.md) file for further information.
* See also the project's [Issue Board](https://github.com/paulscherrerinstitute/wica-js/issues).

# Contact

If you have questions please contact: 'simon.rees@psi.ch'.
