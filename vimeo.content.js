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

function tryToInitPlayer(attemptsLeft, $player) {
	//console.debug("Trying to init player");
	$video = $player.querySelector('video');
	//console.debug("video is " + $video);
	var vpCaptionsStyleString = "width: 50%; margin: 0 auto;";
	if ( $player && $video ) {
	// Only do once!
		//TODO figure out how to do args in js
		setStyle(vpCaptionsStyleString);
		loadConfig().then(config => {
			if ( config.defaultSpeed ) {
				// TODO use config file for this
				//setStyle(config.vpCaptionsStyleString);
			}
		})
	}
	else {
		//console.debug(`[vimeo hotkeys] $buttons`);
		//console.debug(`[vimeo hotkeys] $video`);
		//console.debug(`[vimeo hotkeys] Can't find video (${$video ? 'Y' : 'N'}). Trying ${attemptsLeft} more times.`);
		if ( attemptsLeft > 0 ) {
			setTimeout(function() {
				tryToInitPlayer(--attemptsLeft, $player);
			}, 50);
		}
	}
}

function setStyle(vpCaptionsStyleString) {
	//console.debug("about to set styles in captions");
	$captions = $player = document.querySelector('div.vp-captions');
	$captions.style = vpCaptionsStyleString;
	//console.log($captions);
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



