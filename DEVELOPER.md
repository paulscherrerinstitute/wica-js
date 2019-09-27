# Wica-JS Developer Notes

This page is a random collection of notes intended to assist software developers.

## How to Make a New Software Release

1. Use your favourite editor to set the project version string in the 'package.json' 
   file to the required release number. The release names for this project follow 
   the [semantic versioning](https://semver.org/) naming convention proposed on 
   the GitHub site. 
         
   Examples: 1.0.0, 1.1.0, 1.2.3-rc1, 1.2.3-rc2, 7.1.5-rc19
   
1. Update the [CHANGELOG](CHANGELOG.md) file to describe the new release.

1. Commit locally (- **but don't yet push** -) the latest changes.
    ```
    git commit -m "my latest changes" .
    ```

1. Use the npm 'release' target to create a tag and to push it to the GitHub Server.
    ```
    nvm run release
    ```
1. Verify that the Travis automatic build worked and/or that the expected artifiacts 
   are available on GitHub and on Docker Hub sites.
   
