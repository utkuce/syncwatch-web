# syncwatch-web
Syncs the position and pause state of the video player between connected peers to watch videos together with friends. 
Works with direct urls to video files with codecs supported by browsers or youtube links.

## Demo
https://syncwatch.live

### Instructions
Copy the link in the address bar including the room number to someone so they can join the room. There are 3 possible video source methods that can be used:
#### 1. YouTube
Paste a youtube url into the input bar and press enter or click the stream button.
#### 2. Direct links to video files
Paste a url of a video stored on an http server publicly. Such as https://example.com/video.mp4
Note that a webpage which has a video on it isn't necessarily the link to that video.
In this case the file needs to be encoded with a format supported by the browser such as <i>.mp4</i> or <i>.webm</i>.
They also need to be http streamable as not all mp4 files are streamable.

#### 3. Local video files
Drag-and-drop a video file encoded with a supported format by the browser.<br>
In this case everyone in the room needs to drag-and-drop their local copy of the same file before starting.

## Build

```bash
npm install
npm run build
```

## Run

```
npm run serve
```
