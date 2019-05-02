'use strict';

// we have access to:
// mopidy.playback
// mopidy.tracklist
// mopidy.playlists
// mopidy.library

var currentTime, totalTime, paused, intervalfn; // use storage uphere

var xmlH = new XMLHttpRequest();
xmlH.onreadystatechange = function () {
  if (xmlH.readyState == 4 && xmlH.status == 200) {
    var data = JSON.parse(xmlH.responseText);
    currentTime = parseInt(data.curr);
    totalTime = parseInt(data.total);
    updateTimeBar();
    intervalfn = setInterval(function () {
      if (!paused) {
        currentTime++;
        updateTimeBar();
      }
    }, 1000);
  }
};
xmlH.open("GET", "/currentTime", true);
xmlH.send();

class SpotifyController {

  constructor() {
    // maverick pi
    this.rpcURL = 'http://192.168.140.99:6680/mopidy/rpc';
    this.wsURL = 'ws://192.168.140.99:6680/mopidy/ws';

    // jade pi
    // this.rpcURL = 'http://192.168.2.61:6680/mopidy/rpc';
    // this.wsURL = 'ws://192.168.2.61:6680/mopidy/ws';

    // establish Mopidy API connection
    this.initMopidy().then(m => {
      this.mopidy = m;
      const evt = new Event('spotifyready');
      const spotifyDiv = document.querySelector('.spotify');
      if (spotifyDiv) {
        spotifyDiv.dispatchEvent(evt);
      } else {
        console.error('Unable to bind to mopdiy div');
      }
    });

    // TODO: this needs to be optimized for V8 or we will end up with a slow but stedy memory leak as new hidden classes are created
    this.state = {
      online: false,
      currentTrack: {},
      nextTracks: {},
      previousTrack: {}
    };
  }

  initMopidy() {
    return new Promise((resolve, reject) => {
      const mopidy = new Mopidy({
        autoConnect: true,
        webSocketUrl: this.wsURL
      });

      // register syncState as general event listener
      mopidy.on(this.syncState);

      try {
        // manually set current state
        // after this, syncState will handle updating
        mopidy.on('state:online', () => {
          this.state.online = true;
          if (!window.playlist) {
            mopidy.tracklist.setConsume(true);
            var consume = document.getElementById('consume-toggle');
            if (consume && !consume.classList.contains('on')) {
              consume.classList.add('on');
            }
            var volume = document.getElementById('music-volume-control').value;
            mopidy.mixer.setVolume(parseInt(volume));
            mopidy.playback.getCurrentTrack().then(track => {
              this.state.currentTrack = track;
              if (this.state.currentTrack) {
                console.log(`Currently playing ${this.state.currentTrack.name} by ${this.state.currentTrack.artists[0].name}`);
                mopidy.library.getImages([track.uri]).then(result => updateCoverArt(track.uri, result));
              } else {
                mopidy.playlists.getPlaylists().then(function (playlists) {
                  console.log("Loading playlist");
                  var playlist;
                  for (var i = 0; i < playlists.length; i++) {
                    if (playlists[i].name == "MSP Fall 2018") {
                      playlist = playlists[i];
                    }
                  }
                  // Modification of the Fisher-Yates shuffle algorithm
                  if (playlist != null) {
                    var currentI = playlist.tracks.length,
                        tempVal,
                        randomI;
                    while (0 != currentI) {
                      randomI = Math.floor(Math.random() * currentI);
                      currentI -= 1;

                      tempVal = playlist.tracks[currentI];
                      playlist.tracks[currentI] = playlist.tracks[randomI];
                      playlist.tracks[randomI] = tempVal;
                    }
                    mopidy.tracklist.add(playlist.tracks).then(function (tiTracks) {
                      mopidy.playback.play(tiTracks[0]).then(function () {
                        console.log("Loaded the playlist.");
                      });
                    });
                  }
                }).done();
              }
            });
            mopidy.playback.getCurrentTrack().then(track => {
              this.state.currentTrack = track;
              if (this.state.currentTrack) {
                console.log(`Currently playing ${this.state.currentTrack.name} by ${this.state.currentTrack.artists[0].name}`);
                document.getElementById('currSong').innerHTML = '' + track.name + ' -- ' + track.artists[0].name;
                mopidy.library.getImages([track.uri]).then(result => updateCoverArt(track.uri, result));
              } else {
                console.log('No track currently playing');
              }
            });
          }
          resolve(mopidy);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  sptPlay() {
    if (this.state.online) {
      this.mopidy.playback.play();
    }
  }

  sptPause() {
    if (this.state.online) {
      this.mopidy.playback.pause();
    }
  }

  sptPreviousTrack() {
    if (this.state.online) {
      this.mopidy.playback.previous();
    }
  }

  sptNextTrack() {
    if (this.state.online) {
      this.mopidy.playback.next();
    }
  }

  syncState(evt) {
    console.log("event: ", evt);
    switch (evt) {
      case 'state:online':
        window.music.state.online = true;
        break;
      case 'state:offline':

      // TODO default to connecting first, then wait for connection
      case 'reconnectionPending':
      case 'reconnecting':
        window.music.state.online = false;
        break;

      // TODO on song change, emit event so text can be updated
      case 'event:trackPlaybackStarted':
        window.music.mopidy.playback.getCurrentTrack().then(track => {
          window.music.state.currentTrack = track;
          console.log("currently playling: ", track);
          if (intervalfn) clearInterval(intervalfn);
          totalTime = parseInt(track.length / 1000);
          currentTime = 0;
          updateTimeBar();
          intervalfn = setInterval(function () {
            if (!paused) {
              currentTime++;
              updateTimeBar();
            }
          }, 1000);
          document.getElementById('currSong').innerHTML = '' + track.name + ' -- ' + track.artists[0].name;
          window.music.mopidy.library.getImages([track.uri]).then(result => updateCoverArt(track.uri, result));
        });
        break;

      case 'event:trackPlaybackResumed':
        paused = false;
        break;
      case 'event:trackPlaybackPaused':
        paused = true;
        break;
      // Ensure volumn stays bearable
      case 'event:volumeChanged':
        console.log("Volume changed");
        window.music.mopidy.mixer.getVolume().then(v => {
          document.getElementById('music-volume-control').value = v;
        });
        break;

      case 'event:tracklistChanged':
        console.log("");
        break;

      case 'event:optionsChanged':
        window.music.mopidy.tracklist.getConsume().then(state => {
          if (state) {
            document.getElementById('consume-toggle').classList.remove('off');
            document.getElementById('consume-toggle').classList.add('on');
          } else {
            document.getElementById('consume-toggle').classList.remove('on');
            document.getElementById('consume-toggle').classList.add('off');
          }
        });
      default:
        // console.log(evt);
        break;
    }
  }
}

// make controller available globally as window.music
window.music = new SpotifyController();
console.log(window.music);

var prevTrackImages = [];
const MAX_PREV_IMAGES = 2;
function updateCoverArt(trackUri, imgs) {
  const [image] = imgs[trackUri];
  var elem = document.getElementById('current-track-image');
  if (elem.src && elem.src != image.uri) {
    if (prevTrackImages.length == MAX_PREV_IMAGES) {
      prevTrackImages.pop();
    }
    prevTrackImages.unshift({
      src: elem.src,
      height: elem.height,
      width: elem.width
    });
  }
  for (var i = 0; i < prevTrackImages.length; i++) {
    var t = document.getElementById('prev-track-image-' + (i + 1));
    t.setAttribute("src", prevTrackImages[i].src);
    var scale = (100 - (i + 1) * 10) / 100;
    var height = prevTrackImages[i].height * scale;
    var width = prevTrackImages[i].width * scale;
    var left = i == 0 ? -31 : -35;
    var top = (elem.height - height) / 2;
    top = top + "px ";
    t.setAttribute("height", height + 'px');
    t.setAttribute("width", width + 'px');
    t.style.margin = top + "0 " + top + left + "%";
  }
  elem.setAttribute("src", image.uri);
  elem.setAttribute("height", image.height + 'px');
  elem.setAttribute("width", image.width + 'px');
}

function updateTimeBar() {
  if (currentTime > totalTime) return;
  var displayCurrentTime = '';
  var _copy = currentTime;
  var _minutes = parseInt(_copy / 60);
  var _copy = _copy - _minutes * 60;
  var _seconds = _copy;
  if (_seconds <= 9) {
    _seconds = '0' + _seconds;
  }
  displayCurrentTime = `${_minutes}:${_seconds}`;
  document.getElementById('current-time').innerHTML = displayCurrentTime;

  var displayTotalTime = '';
  _copy = totalTime;
  _minutes = parseInt(_copy / 60);
  _copy = _copy - _minutes * 60;
  _seconds = _copy;
  if (_seconds <= 9) {
    _seconds = '0' + _seconds;
  }
  displayTotalTime = `${_minutes}:${_seconds}`;
  document.getElementById('total-time').innerHTML = displayTotalTime;

  var width = currentTime / totalTime * 100;
  document.getElementById('time-bar').style.width = width + '%';
}