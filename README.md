# Wica-JS in a Nutshell

This is the Wica-JS component.
 
WICA stands for *Web Interface for Controls Applications*. The basic idea is to support the streaming of live data 
from a distributed control system to update a user's web pages in real-time.
 
Wica comprises two main components:

* **Wica-HTTP** - this is a backend HTTP server which receives incoming requests from the web and which generates 
  live data streams containing information for the control system points of interest.

* **Wica-JS** - this is a frontend Javascript library which scans a user's web pages for HTML5 tags defining
  points of interest in the control system. The library then generates requests to the backend server to 
  obtain the necessary data and to update the user's web pages in real-time.

Currently WICA interoperates with the EPICS Control Systems using its well established Channel Access (CA) protocol. 

# Wica-JS Main Features

* HTML5 compliant, pure JS application with very few dependencies.
* Scans webpages for data-wica-* attributes and posts requests to the Wica-HTTP backend server to create the data 
streams for updating the webpage.
* Subscribes to backend server data stream and updated element attributes in response.

# Getting Started
