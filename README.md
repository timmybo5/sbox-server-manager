# S&Box Server Manager

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/timmybo5/sbox-server-manager)

A Windows tool to manage sbox dedicated servers, powered by Electron.

<img src="https://user-images.githubusercontent.com/4988198/234030980-7711a168-e8ff-4587-acf9-c6d07fd5f2ed.png" width="800"/>

### How does it work?

**Output**:

- Server Manager spawns sbox-server.exe (scrds) as a child process and captures all output via stdout.

**Input**:

- All input is handled through RCON since scrds servers require a valid console handle for sdtin.<br/>
- Server Manager uses netstat to find what address matches the hosting port and establishes a direct connection.

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

### Building

- Requirements:
  - npm v8+
  - node v18+

1. Install dependencies with `npm i`
2. Build with `npm run make`

### Special Thanks

- https://github.com/codesbiome/electron-react-webpack-typescript-2023
- https://github.com/EnriqCG/rcon-srcds

## Interface

### Server Settings

<img src="https://user-images.githubusercontent.com/4988198/234031799-ea7105e9-5d32-4b51-9d89-69ae42164880.png" width="800"/>

### Players

<img src="https://user-images.githubusercontent.com/4988198/234032142-9d02457b-baf0-4dc8-809a-154c4ef172ee.png" width="800"/>
