[![Build Status](https://travis-ci.org/paulscherrerinstitute/wica-js.svg?branch=master)](https://travis-ci.org/paulscherrerinstitute/wica-js) 

:construction:
Note: this README is still **under construction**. 

# Overview

This is the Wica-JS Git repository, one component of the PSI's WICA software suite. 
 
WICA stands for *Web Interface for Controls Applications*. The basic idea is to support the streaming of live data 
from a distributed control system to update a user's web pages in real-time.
 
Wica comprises two main components:

* **Wica-HTTP** - this is a backend HTTP server which receives incoming requests from the web and which generates 
  live data streams containing information for the control system points of interest.

* **Wica-JS** - this is a frontend Javascript library which scans a user's web pages for HTML5 tags defining
  points of interest in the control system. The library then generates requests to the backend server to 
  obtain the necessary data and to update the user's web pages in real-time.

Currently WICA interoperates with the EPICS Control Systems using its well established Channel Access (CA) protocol. 


# Main Features

* Collaborates with Wica-HTTP backend server to stream control system data to update user web pages.
* Supports configuration of streaming options including backend data acquisition modes (poll or monitor) and channel 
filtering (eg noise or rate limiting).
* Supports all modern web browsers including Chrome, Firefox, Safari and Edge.
* Supports all current web platforms including desktop, tablet and mobile.
* Supports HTML element text rendering (including visualisation of communication outages).
* Supports JS event generation to enable custom calculations or rendering.
* Implemented as Javascript ES6-module with few external dependencies.
* Works out-of-the-box: no complicated build chain (currently no build chain at all).

# Usage
