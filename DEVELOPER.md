# Wica-JS Developer Notes

This page is a miscellaneous collection of notes intended to assist software developers.

## Additional Wica Library Load Options

In a normal Wica HTML page the wica library is typically loaded by including a script element of the 
form shown below:
```
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8"/>
   <script src="/wica/wica.js" type="module"></script>
   ...
</head>
</html>
```
Wica now supports the possibility of overriding the default library behaviour after load.
This is achieved through the use of HTML data-* attributes which can be defined in the 
script element. Thus:
```
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8"/>
   <script src="/wica/wica.js" data-wicaLoadOption=XXXX type="module"></script>
   ...
</head>
</html>
```

The following load options are currently supported:

### data-wica-log-level=N

This allows the Wica library console logging level to be set. 
See the [API logger documentation](https://paulscherrerinstitute.github.io/wica-js/latest/module-logger.html)
for the supported values and the current default.

Example: Set the log level to INFO level.
```
   ...
   <script src="/wica/wica.js" data-wica-log-level=3 type="module"></script>
   ...
```

### data-wica-stream-server-url=URL

This allows the Wica-JS library to send requests to a wica stream server other than the server which 
was the origin of the user's web page.

This facilitates debugging applications on a local web server whilst obtaining
live data from the control system from within the user's facility.

Example: Target requests to the PSI's Wica Development Server.
```
   ...
   <script type="module" src="https://cas-wica.psi.ch/wica/wica.js" data-wica-stream-server-url="https://cas-wica.psi.ch"></script>
   ...
```

## How to Make a New Software Release

1. Use your favourite editor to set the project version string in the 'package.json' 
   file to the required release number. The release names for this project follow 
   the [semantic versioning](https://semver.org/) naming convention proposed on 
   the GitHub site. 
         
   Examples: 1.0.0, 1.1.0, 1.2.3-rc1, 1.2.3-rc2, 7.1.5-rc19
   
2. Update the [CHANGELOG](CHANGELOG.md) file to describe the new release.

3. Commit locally (- **but don't yet push** -) the latest changes.
    ```
    git commit -m "my latest changes" .
    ```

4. Use the npm 'release' target to create a tag and to push it to the GitHub Server.
    ```
    npm run github-release
    ```
   
