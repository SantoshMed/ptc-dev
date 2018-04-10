/* Indegene iPlayer Video Detection Kit version 0.3
   Creates a Flash or HTML5 native video player with playlist
   DR Feb 4, 2012
*/

var iPlayer;

var iPlayerFlashLoaded = false;
function iPlayerStart() {
  //alert("iPlayerStart");
  iPlayerFlashLoaded = true;
  if (iPlayer) iPlayer.flashStart();
}
function iPlayerClipStart() {
  iPlayer.onClipStart();
}
function iPlayerClipFinish() {
  iPlayer.onClipFinish();
}

function createFlashVideoPlayer() {
  iPlayer = {
    _type: "FLASH9",
    _video: null,
    playList: null,
    started: false,
    callbacks: null,
    init: function(divid, clipArray, callbackFunctions) {
      this.playList = clipArray;
      this.callbacks = callbackFunctions;

      var so = new SWFObject("ivideoplayer.swf", "_iplayer", "100%", "100%", "9", "#FFFFFF");
      so.addParam("play", "true");
      so.addParam("loop", "false");
      so.addParam("wmode", "opaque");
      so.addParam("scale", "noscale");
      so.addParam("menu", "false");
      so.addParam("devicefont", "true");
      so.addParam("allowScriptAccess", "always");
      so.write(divid.substring(1));

      if (iPlayerFlashLoaded) this.flashStart();
    },
    flashStart: function() {
      if (this.started) return;
      this.started = true;
      this._video = window["_iplayer"];
      if (!this._video) this._video = document["_iplayer"];
      this._video.iPlayerAction("setPlaylist", this.playList.join(","));
      if (this.callbacks && this.callbacks.onInit) this.callbacks.onInit.call();
    },
    play: function() {
      if (this._video) this._video.iPlayerAction("videoPlay");
    },
    pause: function() {
      if (this._video) this._video.iPlayerAction("videoPause");
    },
    replay: function() {
      this._video.iPlayerAction("videoReplay");
    },
    seek: function(position) {
    },
    playClip: function(index) {
      if (index<0 || index>=this.playList.length) {
        this.pause();
        return;
      }
      this._video.iPlayerAction("playClip", index);
    },
    nextClip: function() {
      this._video.iPlayerAction("nextClip");
    },
    prevClip: function() {
      this._video.iPlayerAction("prevClip");
    },
    clipDuration: function() {
      var d = parseFloat(this._video.GetVariable("clipDuration"));
      if (isNaN(d) || d<1) return 1;
      return Math.round(d*1000)/1000;
    },
    clipPosition: function() {
      var p = parseFloat(this._video.GetVariable("clipPosition"));
      if (isNaN(p) || p<0) return 0;
      return Math.round(p*1000)/1000;
    },
    clipPercentPlayed: function() {
      //debug(this.clipPosition()+" / "+this.clipDuration());
      return (this.clipPosition() / this.clipDuration()) * 100.0;
    },
    onClipStart: function() {
      if (this.callbacks && this.callbacks.onClipStart) this.callbacks.onClipStart.call();
    },
    onClipFinish: function() {
      if (this.callbacks && this.callbacks.onClipFinish) this.callbacks.onClipFinish.call();
    }
  };
}

function createHTML5VideoPlayer() {
  iPlayer = {
    _type: "HTML5",
    clipNum: 0,
    delayedClipNum: 0,
    playList: null,
    callbacks: null,
    clipStarted: false,
    lastPlayTime: 0,
    init: function(divid, clipArray, callbackFunctions) {
      this.playList = clipArray;
      this.callbacks = callbackFunctions;
      $(divid).html('<video id="_iplayer" src="'+this.playList[0]+'" width="100%" height="100%" preload>Your browser does not support Flash (v9.0.115 or higher) or HTML5 iPad Video</video>');
      this._video = document.getElementById("_iplayer");
      this._video.addEventListener("play", iPlayerClipStart, false);
      this._video.addEventListener("ended", iPlayerClipFinish, false);
      if (this.callbacks && this.callbacks.onInit) this.callbacks.onInit.call();
    },
    play: function() {
      this._video.play();
    },
    pause: function() {
      this._video.pause();
    },
    replay: function() {
      this._video.currentTime = 0;
      this._video.play();
    },
    seek: function(position) {
      this._video.currentTime = position;
      this._video.play();
    },
    playClip: function(index) {
      if (index<0 || index>=this.playList.length) {
        this.pause();
        return;
      }
      this.clipStarted = false;
      this.clipNum = index;
      this._video.setAttribute("src", this.playList[this.clipNum]);
      this._video.play();
    },
    nextClip: function() {
      if (this.clipNum<this.playList.length) this.playClip(this.clipNum+1);
    },
    prevClip: function() {
      if (this.clipNum>0) this.playClip(this.clipNum-1);
    },
    clipDuration: function() {
      if (!this._video.duration) return 1;
      var d = parseFloat(this._video.duration);
      if (d==Number.NaN || d<1) return 1;
      return Math.round(d*1000)/1000;
    },
    clipPosition: function() {
      if (!this._video.currentTime) return 0;
      var p = parseFloat(this._video.currentTime);
      if (p==Number.NaN || p<0) return 0;
      return Math.round(p*1000)/1000;
    },
    clipPercentPlayed: function() {
      var p = (this.clipPosition() / this.clipDuration()) * 100.0;
      if (p > 100 | p < 0) p = 0;
      return p;
    },
    onClipStart: function() {
      if (this.clipStarted) return;
      this.clipStarted = true;
      if (this.callbacks && this.callbacks.onClipStart) this.callbacks.onClipStart.call();
    },
    onClipFinish: function() {
      if (this.callbacks && this.callbacks.onClipFinish) this.callbacks.onClipFinish.call();
    }
  };
}

// Other sniffers either do too much, need DOM to load or are not quite accurate. 
// All we need to know is if this is an iPad or IE. 
// Ignore Flash Player version for now. 9.0.115 is required.
var _userAgent = {};
_userAgent.ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
_userAgent.iPad = navigator.userAgent.indexOf("iPad;")>0;

if (_userAgent.iPad) createHTML5VideoPlayer();
else createFlashVideoPlayer();
