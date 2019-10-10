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