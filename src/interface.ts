// ************************************************
// functions related to updating the user interface
// ************************************************

import {sendVideoSource} from './sync'
import * as room from './room'
import * as video from './video'
import * as webtorrent from './webtorrent'

import toastr from 'toastr'

var pjson = require('../package.json');
const titleName = document.getElementById("titleName");
if (titleName)
    titleName.innerHTML += "<br>v" + pjson.version;

document.getElementsByTagName("title")[0].innerHTML += " v" + pjson.version;

const streamButton = <HTMLButtonElement> document.getElementById('streamButton');
streamButton.onclick = handleSourceInput;

const sourceInput = document.getElementById("sourceInput");
if (sourceInput) {
    sourceInput.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {  // Number 13 is the "Enter" key on the keyboard
            event.preventDefault();  // Cancel the default action, if needed
            streamButton.click();    // Trigger the button element with a click
        }
    }); 
}

var dragDrop = require('drag-drop');
var videoExtensions = require('video-extensions');
dragDrop('body', function (files: any) {
    var ext = files[0].name.substr(files[0].name.lastIndexOf('.') + 1);
    if (videoExtensions.includes(ext)){

        // TODO: validate video encoding for browser
        console.log("Setting local video: " + files[0].name);
       
        webtorrent.seed(files[0]);
        video.setSource(URL.createObjectURL(files[0])); 
    }
});

export function setRoomNumber(roomId: string) {

    const roomNumber: string = roomId.split('-')[1];
    window.location.hash = "r=" + roomNumber;

    const roomNumberElement = document.getElementById('roomNumber');
    if (roomNumberElement) {
        roomNumberElement.innerHTML = 'Joined room ' + roomNumber;
        roomNumberElement.style.color = "white";
    }        
}

export function connectionLost() {
    const roomNumberElement = document.getElementById('roomNumber');
    if (roomNumberElement) {
        roomNumberElement.innerHTML = 'Not connected!';
        roomNumberElement.style.color = "red";
    }
}

export function updateUsersDisplay(data: any, myUserId: string) {

    var usersElement = document.getElementById('users');
    if (usersElement) {
   
        usersElement.innerHTML = '';
  
        for (var key in data) {

            var userId = key;
            var userName = data[key]["name"];
            var user = document.createElement('a');                  
            user.innerHTML = userName;
         
            if (userId === myUserId) {

                user.setAttribute('class', 'class="w3-bar-item w3-button w3-hover-white"');
                user.setAttribute("style", "padding:16px;")
                user.innerHTML += " ✎"
                user.addEventListener('click', function(){
                    editName();
                });
                ownUserElement = user;

            } else {
                user.setAttribute("style", "display:block; padding:16px;")
            } 
            
            usersElement.appendChild(user);
        }
    }
}

var ownUserElement : HTMLAnchorElement;
function editName() {

    var name = prompt("Please enter your name");
    if (name != null) {

        localStorage['username'] = name;
        ownUserElement.innerHTML = name;
        room.updateUsername(name);
    }
}

export function handleSourceInput() {
    const sourceInput = <HTMLInputElement> document.getElementById('sourceInput');
    video.setSource(sourceInput.value);
    sendVideoSource(sourceInput.value);
    sourceInput.value = "";
  }

export function setVideoSourceDisplay(src: string, provider: string) {

  var videoSrc = "Video source: <i>" + src + "</i> (type: " + provider + ")";
  var videoSourceElement = document.getElementById("video_source");
  if (videoSourceElement)
    videoSourceElement.innerHTML = videoSrc;
}

export function autoPlayWarning() {
    console.log("Displaying autoplay warning");

    toastr.options = {
        "closeButton": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": true,
        "timeOut" : 10000
      }

    toastr.warning("Autoplay was not allowed by the browser, muted video to compensate");
}

var torrentElement = document.getElementById("torrent_progress");
export function updateTorrentElement(value: string) {
    if (torrentElement)
        torrentElement.innerHTML = value;
}