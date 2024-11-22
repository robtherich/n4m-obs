# n4m-obs
A node-for-max script and tester patches for controlling OBS recording functionality from Max.

Requires OBS version > 28.0 containing built-in WebSocket support, and utilizes the [obs-websocket-js](https://github.com/haganbmj/obs-websocket-js) package.

Mac and Win tester patches require either the [Syphon (Mac)](https://cycling74.com/packages/syphon) or [Spout (Win)](https://cycling74.com/packages/spout) Max packages installed from the [Package Manager](https://cycling74.com/packages).

From OBS go to Tools -> WebSocket Server Settings and enable the WebSocket server
<img width="696" alt="Screenshot 2024-11-22 at 11 46 39 AM" src="https://github.com/user-attachments/assets/e852dcf2-1934-4c45-a78c-e059a6d899fe">
