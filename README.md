# S&Box Server Manager
A Windows tool to manage sbox dedicated servers, powered by Electron.

<img src="https://user-images.githubusercontent.com/4988198/233678477-21b0ceef-fbbd-454c-b80f-604f6353f472.png" width="800"/>

### How does it work?
**Output**:
 * Server Manager spawns sbox-server.exe (scrds) as a child process and captures all output via stdout.

**Input**: 
 * All input is handled through RCON since scrds servers require a valid console handle for sdtin.<br/>
 * Server Manager uses netstat to find what address matches the hosting port and establishes a direct connection.

### Features
* Console
* Player list with kicking
* Multi-server configuration support

### Technologies
* Electron
* Node.js
* React.js + Typescript
* Redux Toolkit
* Webpack

### Building
* Requirements:
  * npm v8+
  * node v18+
1. Install dependencies with `npm i`
2. Build with `npm run make`

### Special Thanks
* https://github.com/codesbiome/electron-react-webpack-typescript-2023
* https://github.com/EnriqCG/rcon-srcds

## Interface
### Players
<img src="https://user-images.githubusercontent.com/4988198/233678519-2a8bd6aa-b9b0-4737-8e5f-72bd0c8648e1.png" width="800"/>

### Settings
<img src="https://user-images.githubusercontent.com/4988198/233678534-998fc966-aeda-4450-9de6-c67ef86db039.png" width="800"/>
