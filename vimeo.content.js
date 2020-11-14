var $video;
var $player;

function loadConfig() {
	//console.debug('[vimeo hotkeys] Load config');
	return new Promise(function(resolve) {
		if (chrome.storage) {
			chrome.storage.local.get(['config'], function(items) {
				resolve(items.config || {});
			});
		}
		else {
			resolve({});
		}
	});
}

function onTimeUpdate(e) {
	var delta = Math.max(0.5, 0.5 * this.playbackRate);
	if ( this.currentTime >= this.duration - delta ) {
		this.currentTime = 0;
	}
}

function positionController(video) {
	this.video = video;

	this.changePosition = function(direction, seconds) {
		var position = this.video.currentTime;
		var offset = direction * 5;
		this.video.currentTime = position - offset + (direction * seconds);
		console.debug("Position is " + position + direction);
	}
}


function speedController(video) {
	this.speeds = [0.2, 0.3333, 0.5, 0.6666, 1, 1.25, 1.5, 2, 2.5, 3, 4];
	this.video = video;

	this.setSpeed = function(speed) {
		console.debug("setting speed to " + speed);
		this.video.playbackRate = speed;
	}

	this.deltaSpeed = function(direction) {
		var curSpeed = this.video.playbackRate;
		var curSpeedIndex = this.speeds.indexOf(curSpeed);

		// On the scale, so find next by index
		if ( curSpeedIndex != -1 ) {
			if ( this.speeds[curSpeedIndex + direction] ) {
				this.setSpeed(this.speeds[curSpeedIndex + direction]);
			}
		}
		else {
			var candidates = this.speeds.filter(function(speed) {
				return direction > 0 ? (speed > curSpeed) : (speed < curSpeed);
			});
			if ( candidates.length ) {
				var newSpeed = direction > 0 ? candidates[0] : candidates[candidates.length-1];
				this.setSpeed(newSpeed);
			}
		}
	}
}

function tryToInitPlayer(attemptsLeft, $player) {
	console.debug("Trying to init player");
	$video = $player.querySelector('video');
	console.debug("video is " + $video);

	if ( $player && $video ) {
	// Only do once!
		// clue on how to keep keydown from looping:
		// https://stackoverflow.com/a/17514833/5650506
		loadConfig().then(config => {
			if ( config.defaultSpeed ) {
				setSpeed(config.defaultSpeed);
			}
		})
	}
	else {
		//console.debug(`[vimeo hotkeys] $buttons`);
		//console.debug(`[vimeo hotkeys] $video`);
		console.debug(`[vimeo hotkeys] Can't find video (${$video ? 'Y' : 'N'}). Trying ${attemptsLeft} more times.`);
		if ( attemptsLeft > 0 ) {
			setTimeout(function() {
				tryToInitPlayer(--attemptsLeft, $player);
			}, 50);
		}
	}
}

var $stateChanged = false;
function makeMutationObserver() {
    $player = document.querySelector('div.player');
    if ( $player ) {
    	var mo = new MutationObserver(function(muts) {
    		// Try to find buttons menu & video element
    		tryToInitPlayer(2, $player);
    	});
    	mo.observe($player, {"childList": true, "attributes": true});
    }
}

makeMutationObserver();

document.addEventListener('keydown', function(e) {
}, false);

var $down = false;
document.addEventListener('keydown', function(e) {
	if (!($video) || !($player)) {
	    console.debug("video not activated, keydown listener");
	    if ( e.altKey && e.ctrlKey ) {
	    	if (e.code === 'KeyV' ) {
	    		console.log("pressed Ctrl Alt v");
			makeMutationObserver();
	    	}
	    } else {
	    	console.log(e.code);
	    }
	}

	if ( $video && $player && !($stateChanged) && !($down) && !e.altKey && !e.ctrlKey ) {
		var speedCont = new speedController($video);
		var positionCont = new positionController($video);
	
		console.debug("video activated, keydown listener running");
		if ( !($stateChanged) && e.code === 'Minus' ) {
			$stateChanged = true;
			speedCont.deltaSpeed(-1);
		}
		else if ( !($stateChanged) && e.code === 'Equal' ) {
			$stateChanged = true;
			speedCont.deltaSpeed(+1);
		}
		else if ( !($stateChanged) && e.code === 'ArrowRight' ) {
			$stateChanged = true;
			positionCont.changePosition(+1, 1);
		}
		else if ( !($stateChanged) && e.code === 'ArrowLeft' ) {
			$stateChanged = true;
			positionCont.changePosition(-1, 1);
		} 
		else if ( !($stateChanged) && e.code === 'Comma' ) {
			$stateChanged = true;
			positionCont.changePosition(+1, 3);
		}
		else if ( !($stateChanged) && e.code === 'Period' ) {
			$stateChanged = true;
			positionCont.changePosition(-1, 3);
		}
	}
	$down = true;
}, false);

document.addEventListener('keyup', function() {
	console.debug("key up");
	$down = false;
	$stateChanged = false;
}, false);


