// ************************************************
// functions related to updating the user interface
// ************************************************

import * as firebase from 'firebase/app'
import {sendData} from './sync'
import * as video from './video'

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
        video.setSource(URL.createObjectURL(files[0])); 
    }
});

export function setRoomNumber(roomId: string) {

    const roomNumber: string = roomId.split('-')[1];
    window.location.hash = "r=" + roomNumber;

    const roomNumberElement = document.getElementById('roomNumber');
    if (roomNumberElement)
        roomNumberElement.innerHTML = 'Joined room ' + roomNumber;
}

export function updateUsersDisplay(data: any, roomId: string, myUserId: string) {

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
                    editName(roomId, myUserId)
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
function editName(roomId: string, myUserId: string) {

    var name = prompt("Please enter your name");
    if (name != null) {

        localStorage['username'] = name;
        ownUserElement.innerHTML = name;
        firebase.database().ref(roomId).child("users/" + myUserId + "/name")
            .set(name, function(error: Error | null){
                if (error) {
                    console.error(error);
                    return;
                }   
                console.log("Updated name of " + myUserId + " to " + name );
            }
        );
    }
}

export function handleSourceInput() {
    const sourceInput = <HTMLInputElement> document.getElementById('sourceInput');
    video.setSource(sourceInput.value);
    sendData({"sourceURL": sourceInput.value});
    sourceInput.value = "";
  }

export function setVideoSourceDisplay(src: string, provider: string) {

  var videoSrc = "Video source: <i>" + src + "</i> (type: " + provider + ")";
  var videoSourceElement = document.getElementById("video_source");
  if (videoSourceElement)
    videoSourceElement.innerHTML = videoSrc;
}

export function autoPlayWarning(playPromise: Promise<void>) {

    playPromise.then(function() {

        const autoplay_warning = document.getElementById("autoplay_warning");
        if(autoplay_warning)
          autoplay_warning.setAttribute("style", "display: none;")
    
      }).catch(function(error: Error) {
        
        const autoplay_warning = document.getElementById("autoplay_warning");
        if(autoplay_warning)
          autoplay_warning.setAttribute("style", "display: block; color:white; text-align: center;")
    
      });
}