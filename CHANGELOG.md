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
  * Issue #6 Precision ('prec') field has no effect when specified in wica-rendering-props object 
  * Issue #7 Create Wica-JS 1.1.3 Release
  
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
  
* [1.3.0] Released 2020-09-15

  Created initial support for 'wica-stream-props' attribute.
  Updated tooltip support so that tooltips are now handled by default through CSS rather
  than by document-text-renderer.
  Merged in GitHub dependabot fixes.
  Fixed many IntelliJ warnings.
  
  * Issue #20 DEPENDENCIES: Bump lodash from 4.17.15 to 4.17.19.
  * Issue #21 ENHANCEMENT: Create release 1.3.0-RC1.
  * Issue #22 ENHANCEMENT: Miscellaneous small improvements.
  * Issue #23 ENHANCEMENT: Make JsDoc improvements to remove IntelliJ warning messages.
  * Issue #24 ENHANCEMENT: Add support for wica-stream-props attribute.
  * Issue #25 DEPENDENCIES: Bump bestzip from 2.1.4 to 2.1.7 
  * Issue #26 DEPENDENCIES: Bump bl from 3.0.0 to 3.0.1 
  * Issue #27 ENHANCEMENT: Create release 1.3.0.
  * Issue #28 ENHANCEMENT: Attempt to cleanup tooltip implementation.
  * Issue #29 DEPENDENCIES: Update all remaining dependencies to latest.
  * Issue #30 ENHANCEMENT: Improve Docker naming on wica-related volumes.
  
* [1.3.1] Released 2020-09-19 

  Tooltips got bigger. Fixed incorrect documentation on WicaStreamProperties. Default precision is 3 digits.
  Monitor flux runs at 200ms. 
  
  * Issue #31 ENHANCEMENT: Miscellaneous Jsdoc improvements.
  * Issue #32 ENHANCEMENT: Increase default size of tooltip popup text.
  * Issue #33 ENHANCEMENT: Create release 1.3.1.

* [1.3.2] Released 2020-10-19 

  Fixed bug in stream handling which could sometimes result in multiple streams being
  requested with empty payloads.

  * Issue #34 BUG Add support for data-wica-assigned-stream-name.
  * Issue #35 ENHANCEMENT: Create release 1.3.2
  
* [1.4.0] Released 2020-12-03 

  Support for auto-generation of the Wica Channel instance specifier. This means that in the HTML
  file multiple tags can use the same wica channel. Thus, the following definition is valid
  and would result in two unique control system channels being generated.
 
  ```
     <label data-wica-channel-name="my-channel" data-wica-channel-props='{ "daqmode"="poll" }'></label>
     <label data-wica-channel-name="my-channel" data-wica-channel-props='{ "daqmode"="monitor" }'></label>
     <label data-wica-channel-name="my-channel" data-wica-channel-props='{ "daqmode"="monitor" }'></label>
     <label data-wica-channel-name="my-channel" data-wica-channel-props='{ "daqmode"="monitor" }'></label>
  ```
  
  The auto-allocation instance specifier sequence is currently set in the library as a
  non-confgurable parameter (current start setting = 1000). 
  
  Support for suppressing wica CSS autoload for situations which do not require it. To suppress
  CSS autoload include the wica-js library as follows:
  
  ```
     <script data-wica-autoload-css=false src="wica/wica.js" type="module"></script>
  ```
   
  * Issue #38 Create release 1.4.0-rc1
  * Issue #39 ENHANCEMENT Add support for auto-generation of the Wica Channel instance specifiers.
  * Issue #40 ENHANCEMENT Add support for CSS autoload configuration feature.
  * Issue #41 Create release 1.4.0.
  
* [1.5.0] Released 2020-12-04    

  A few tweaks on the previous version.
  
  The library startup options now include the following variants, or combinations thereof:
  
  ```
  <script data-wica-log-level="[0-7]" src="wica/wica.js" type="module"></script>
  <script data-wica-stream-server-url="<serverUrl>" src="wica/wica.js" type="module"></script>
  <script data-wica-no-css="true|false>" src="wica/wica.js" type="module"></script>
  <script data-wica-with-text-renderer="true|false" src="wica/wica.js" type="module"></script>
  <script data-wica-auto-activate="true|false" src="wica/wica.js" type="module"></script>
  ```
  The wica library logging levels go from 0-7 in increasing levels of chattiness.  The categories
  are as follows: [0=NONE, 1=ERROR, 2 =WARN, 3=INFO, 4=LOG, 5=DEBUG, 6 = TRACE] 
 
  By default the library log level is set to WARN (=2), the wica serverUrl is set to target
  the host where the web page was loaded and all the boolean options are set to true.
  
  Issues addressed:
  
   * Issue #42 BUG FIX: Suppress sending stream create requests with empty channels if there are no wica channels discovered in the stream.
   * Issue #43 BUG FIX: Ensure that stream shutdown actively closes EventSource.
   * Issue #44 ENHANCEMENT: Add support for conditional startup of the wica text renderer function.
   * Issue #45 Create release 1.5.0
   * Issue #46 ENHANCEMENT: Cleanup library startup options and provide new 'data-wica-auto-activate' option.

* [1.5.1] Released 2020-12-04    

  Bug fix release which fixes my previously incorrect understanding of how HTML boolean
  attributes are meant to work. HTML does not support "true" or "false" on boolean attributes.
  To assert a boolean attribute it must be present; when not present the attribute is
  set to false. The library startup options therefore need to be a bit different to 
  how they were documented above. 
  
  The keywords "no-css", "no-render" and "no-autoload" are now available and can be used to
  suppress loading the wica CSS file, to suppress the rendering of the text content of wica
  HTML elements, and/or to entirely suppress document support. Thus:
    ```
    <script data-wica-no-css src="wica/wica.js" type="module"></script>
    <script data-wica-no-render src="wica/wica.js" type="module"></script>
    <script data-wica-no-autoload src="wica/wica.js" type="module"></script>
    ```
   * Issue #47 BUG FIX: Create release 1.5.1
