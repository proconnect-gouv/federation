# Explaination

This settings allows VSCode to be sync with the local containers through a specific port per container.
The Docker-Compose Dockerfile is set to open the ports and start the Nest app with this degub port.
The launch.json configuration connect the container with VSCode through the port.
Typescript is configured to export in `./dist` folder a compile map file that do the binding between the compile code in the container and the native code in the debug environement.

## List of external URL

<https://go.microsoft.com/fwlink/?linkid=830387>
<https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome>

To select an `task` file press Ctrl+Shift+B

To debug in Chrome, go to:
chrome://inspect/#devices

Press the button configure and add the localhosts:

- localhost:9229
- localhost:9239
