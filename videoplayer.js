exports.start = function(url) {

    const mpvAPI = require('node-mpv');
  
    // TODO: fix absolute path
    const mpvPlayer = new mpvAPI();
  
    console.log("Starting video player with source url: " + url);
    console.log("Please wait...");
  
    var firstStart = true;
    mpvPlayer.on('started', function(status) {
  
      if (firstStart) {
  
        mpvPlayer.goToPosition(0.1);
        mpvPlayer.pause();
  
        firstStart = false;
      }
  
    });
  
    mpvPlayer.on('statuschange', function(status){
      //console.log(status);
    });
  
    mpvPlayer.on('paused', function(status) {
      console.log("video paused");
    });
  
    mpvPlayer.on('resumed', function(status) {
      console.log("video resumed");
    });
  
    mpvPlayer.on('seek', function(timeposition) {
      console.log("video position changed " + timeposition.end);
    });
  
    mpvPlayer.load(url);
    //mpvPlayer.load("https://www.youtube.com/watch?v=KBRU2VkUeh4");
  
    
  
    //mpv.volume(70);
  }