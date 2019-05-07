var express = require('express');
var router = express.Router();
const Mopidy = require('mopidy');
var fs = require('fs');

const mopidy = new Mopidy({
	webSocketUrl : 'ws://192.168.140.99:6680/mopidy/ws'
});

var currentTime = 0, totalTime=0, paused = false, intervalfn;

mopidy.on('event:trackPlaybackStarted', () => {
	mopidy.playback.getCurrentTrack().then((track) => {
		if (intervalfn) clearInterval(intervalfn);
			totalTime = parseInt(track.length / 1000);
			currentTime = 0;
			intervalfn = setInterval(function() {
			if (!paused) {
				currentTime++;
			}
	    }, 1000);
	});
});
mopidy.on('event:trackPlaybackResumed', () => {
	paused = false;
});
mopidy.on('event:trackPlaybackPaused', () => {
	paused = true;
});

// render home page
router.get('/', (req, res, next) => {
  res.render('index', {title: 'Mavboard'});
});
router.get('/currentTime', (req, res, next) => {
	var data = JSON.stringify({
		curr: currentTime,
		total: totalTime
	});
	res.send(data);
});
module.exports = router;
