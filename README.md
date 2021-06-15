# syncwatch-web
Syncs the position and pause state of the video player between connected peers to watch videos together with friends. 
Works with direct urls to video files with codecs supported by browsers or youtube links.

## Demo
https://syncwatch.live

### Instructions
Copy the link in the address bar including the room number to someone so they can join the room. There are 2 possible video source methods that can be used:
#### YouTube
Enter a youtube url into the input bar, and press enter or click the stream button.
#### Direct links to video files
Enter a url of a video stored on an http server publicly, such as https://example.com/video.webm<br>
In this case the file needs to be encoded with a format supported by the browser. For example, <i>h.264</i> video and <i>aac</i> audio standards.
They also need to be http streamable, i.e., encoded with <code>-movflags +faststart</code>.
Note that a webpage which has a video on it isn't necessarily the link to that video.

<!--
#### Local video files
Drag-and-drop a video file encoded with a supported format by the browser and it will be shared via 
[webtorrent](https://webtorrent.io/) to everyone in the room.
-->
## Setup

- Create a [Realtime Database](https://firebase.google.com/docs/database) project on Google's Firebase
- Go to [Firebase Console](https://console.firebase.google.com) and get the credentials under project settings
- Fill the `firebaseConfig` variable in `src/room.ts` with the credentials

## Development

- Use `npm run serve` for local testing

## Deploy

- `npm install` and `npm run build` will create the `dist/` folder
- Upload the `dist/` folder to a static host

