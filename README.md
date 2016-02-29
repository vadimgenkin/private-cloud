# PiBox Web File Manager
## Introduction
The PiBox is yet another Web-based file manager. Its main purpose is to provide access to remote machine file system from any Internet enabled device, emphasizing on the mobile. The client and server sides communicate via REST API.
## Main Abilities
The core system abilities are:
* basic file/directory operations (create, delete, copy, move, rename)
* network related operations (upload, download)
* media related operations (streaming to client, opening locally)

## Supported Platforms
### The PiBox Server
ATM, the PiBox Server is targeted to run on Linux and Windows systems.
### The PiBox Client
In addition to the Web user interface available through a Web Browser on any platform, there is hybrid Android app that extends the client abilities (e.g. auto-backup, photo/video backup, etc)
## Security
The access to the remote file system is granted accordingly to the remote machine user permissions. Any access attempt is conditioned with remote system user authentication.