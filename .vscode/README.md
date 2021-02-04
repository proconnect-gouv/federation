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
- localhost:9230
- localhost:9231
- localhost:9232
- localhost:9233
- localhost:9234
- localhost:9235
- localhost:9236
- localhost:9237
- localhost:9238
- localhost:9239
- localhost:9240
- localhost:9241
- localhost:9242
- localhost:9243

## Future containers links

This is the configuration to update when the repository `fi-mock` will be created within `fc`/apps

// -- FCP - FIP1v2
// {
//   "name": "FCP - FIP1v2",
//   "type": "node",
//   "request": "attach",
//   "port": 9236, // <-- @see /fc-docker/compose/corev2.yml:333
//   "address": "localhost",
//   "protocol": "inspector",
//   "localRoot": "${workspaceFolder}/back",
//   "remoteRoot": "/var/www/app",
//   "outFiles": ["${workspaceFolder}/back/dist/apps/mock-xxxxxxxxxxxxx-fcp/**/*.js"],
//   "skipFiles": [
//     "${workspaceFolder}/back/node_modules/**/*.js",
//     "<node_internals>/**/*.js"
//   ],
//   "cwd": "${workspaceFolder}/back",
//   "internalConsoleOptions": "openOnFirstSessionStart",
//   "restart": true,
//   "sourceMaps": true,
// },

// -- FCP - FIP2v2
// {
//   "name": "FCP - FIP2v2",
//   "type": "node",
//   "request": "attach",
//   "port": 9237, // <-- @see /fc-docker/compose/corev2.yml:333
//   "address": "localhost",
//   "protocol": "inspector",
//   "localRoot": "${workspaceFolder}/back",
//   "remoteRoot": "/var/www/app",
//   "outFiles": ["${workspaceFolder}/back/dist/apps/mock-xxxxxxxxxxxxx-fcp/**/*.js"],
//   "skipFiles": [
//     "${workspaceFolder}/back/node_modules/**/*.js",
//     "<node_internals>/**/*.js"
//   ],
//   "cwd": "${workspaceFolder}/back",
//   "internalConsoleOptions": "openOnFirstSessionStart",
//   "restart": true,
//   "sourceMaps": true,
// },
