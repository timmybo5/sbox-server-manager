# S&Box Server Manager

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/timmybo5/sbox-server-manager)

A Windows tool to manage sbox dedicated servers, powered by Electron.

<img src="https://user-images.githubusercontent.com/4988198/234030980-7711a168-e8ff-4587-acf9-c6d07fd5f2ed.png" width="800"/>

### Before Use

Server Manager uses SteamCMD, you need to install it seperately, you can find information about how to install and use SteamCMD here:
<https://developer.valvesoftware.com/wiki/SteamCMD>.

Once SteamCMD has been installed, you can install the [s&box Server](https://steamdb.info/app/1892930/info/) by running the following command in Windows Terminal from the directory you installed SteamCMD.
`./steamcmd +login anonymous +app_update 1892930 validate +quit`

**<ins>Install SteamCMD and run the s&box install cmd once<ins>**

### How does it work?

Server Manager spawns a PTY shell with sbox-server.exe (scrds) as a child process and directly controls the process.

### Features

- Console
- Player list with kicking
- Multi-server configuration support
- Search public maps and gamemodes by name

### Technologies

- Electron
- Node.js
- React.js + Typescript
- Redux Toolkit
- Webpack
- Node-pty

### Building

- Requirements:
  - npm v8+
  - node v18+
  - Python >=v3.7
  - Visual Studio:
    - MSVC v142 (or newer) C++ build tools
    - Windows 10/11 SDK (the one matching your OS)

1. Install dependencies with `npm i`
2. Build with `npm run make`

### Special Thanks

- https://github.com/codesbiome/electron-react-webpack-typescript-2023
- https://github.com/microsoft/node-pty

## Interface

### Server Settings

<img src="https://user-images.githubusercontent.com/4988198/234031799-ea7105e9-5d32-4b51-9d89-69ae42164880.png" width="800"/>
<img src="https://github.com/timmybo5/sbox-server-manager/assets/4988198/a6908502-b509-4b45-840e-293eb311a43a.png" width="800"/>

### Players

<img src="https://user-images.githubusercontent.com/4988198/234032142-9d02457b-baf0-4dc8-809a-154c4ef172ee.png" width="800"/>

