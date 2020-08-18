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

function createChangePosition(video) {

	function changePosition(direction) {
		var position = video.currentTime;
		var offset = direction * 5;
		video.currentTime = position - offset + direction;
		console.debug("Position is " + position + direction);
	}

	return [changePosition];
}


function createDeltaSpeed(video) {
	const speeds = [0.2, 0.3333, 0.5, 0.6666, 1, 1.25, 1.5, 2, 2.5, 3, 4];

	function setSpeed(speed) {
		console.debug("setting speed to " + speed);
		video.playbackRate = speed;
	}

	function deltaSpeed(direction) {
		var curSpeed = video.playbackRate;
		var curSpeedIndex = speeds.indexOf(curSpeed);

		// On the scale, so find next by index
		if ( curSpeedIndex != -1 ) {
			if ( speeds[curSpeedIndex + direction] ) {
				setSpeed(speeds[curSpeedIndex + direction]);
			}
		}
		else {
			var candidates = speeds.filter(function(speed) {
				return direction > 0 ? (speed > curSpeed) : (speed < curSpeed);
			});
			if ( candidates.length ) {
				var newSpeed = direction > 0 ? candidates[0] : candidates[candidates.length-1];
				setSpeed(newSpeed);
			}
		}
	}

	return [deltaSpeed];
}

function tryToInitPlayer(attemptsLeft, $player) {
	//var $buttons = $player.querySelector('.vp-controls-wrapper .vp-sidedock, .controls-wrapper .sidedock');
	var $video = $player.querySelector('video');
        //console.debug('video is ' + $video);
        //console.debug('player is ' + $player);

	if ( $player && $video ) {
	// Only do once!
		//console.debug("there's a player and a video");

		const [deltaSpeed] = createDeltaSpeed($video);
		const [changePosition] = createChangePosition($video);
		// $buttons.appendChild($box2);

		// clue on how to keep keydown from looping:
		// https://stackoverflow.com/a/17514833/5650506
		var $down = false;
		document.addEventListener('keydown', function(e) {
			console.debug("key down");
			if ( !($speedChanged) && !($down) && !e.altKey && !e.ctrlKey ) {
				if ( !($speedChanged) && e.code === 'Minus' ) {
					$speedChanged = true;
					deltaSpeed(-1);
				}
				else if ( !($speedChanged) && e.code === 'Equal' ) {
					$speedChanged = true;
					deltaSpeed(+1);
				}
				else if ( !($speedChanged) && e.code === 'ArrowRight' ) {
					$speedChanged = true;
					changePosition(+1);
				}
				else if ( !($speedChanged) && e.code === 'ArrowLeft' ) {
					$speedChanged = true;
					changePosition(-1);
				}

			}
			$down = true;
		}, false);

		document.addEventListener('keyup', function() {
			console.debug("key up");
			$down = false;
			$speedChanged = false;
		}, false);

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

var $player = document.querySelector('div.player');
var $speedChanged = false;
console.debug("player is " + $player);
if ( $player ) {
	var mo = new MutationObserver(function(muts) {
		// Try to find buttons menu & video element
		tryToInitPlayer(2, $player);
		console.debug("There's a player");
	});
	mo.observe($player, {"childList": true, "attributes": true});
}
