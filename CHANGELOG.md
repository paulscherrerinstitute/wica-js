# Overview

This log describes the functionality of tagged versions within the repository.

# Tags  

* [1.0.0] 
  Created first version based on version 1.7.0-RELEASE of the incubator project on PSI's 
  internal GitLab Server (ch.psi.wica2).
  
  Note: this release was created manually by zipping up the source directory. In future
  releases the travis build will be updated to perfrom this task manually.
   
* [1.1.0]
  Now restructured to use node-based toolchain.
  Uses Node Rollup plugin to bundle Wica-JS as standalone module.
  Uses Node Terser plugin to create minified library output.
  Upgraded Travis yaml build recipe to deploy API docs to GitHub Pages Area and 
  zipped release assets to GitHub Releases Area. Also builds image for Docker Hub.
  
* [1.1.1]
  Documentation improvements.
  
* [1.1.2]
  Now exports client API classes.
  Suppressed terse JS output to ease debugging.
  Added bare modules support.
  
* [1.1.3]
  Fixed bug which affected precisiom. Now builds and exports separate wica/client-api.js 
  classes.
  #6 Precision ('prec') field has no effect when specified in wica-rendering-props object 
  #7 Create Wica-JS 1.1.3 Release
  
* [1.2.0] 
  * Issue #8 Create Wica-JS 1.2.0 Release
  * Issue #9 ENHANCEMENT: When navigating away from wica pages send delete stream request asynchronously.
  * Issue #10 ENHANCEMENT: Optimise document-stream-connector to used html element cache.
  * Issue #12 ENHANCEMENT: Add support for publishing on PSI's local NPM server.
  * Issue #13 ENHANCEMENT: Add support for defining Wica-JS library startup behaviour in script tag.
  * Issue #14 Create license.
  * Issue #15 Update packages after NPM audit. 

* [1.2.1] 
  * Issue #9 ENHANCEMENT: When navigating away from wica pages send delete stream request asynchronously.
    Adjusted feature for compatibility with Wica-HTTP Release 1.4.0. POST and DELETE HTTP requests now 
    go to the same endpoint. POST requests must additionally contain 'DELETE'  string literal in 
    content body. 
  * Issue #16 Create Wica-JS 1.2.0 Release.  

* [1.2.2] Released 2020-06-29
  * Issue #18 DEPENDENCIES: Upgrade JSON5 version from 2.1.0 -> 2.1.3 to address GitHub security alert. 
  * Issue #19 DEPENDENCIES: Create Wica-JS 1.2.2 Release.
  
* [1.3.0-RC1] Released 2020-08-02
