window.onload = function() {	
	var context = new webkitAudioContext();
	var playButton = document.getElementById("playButton");

	var positions;
	var vibratoRunning;
	// var analyser = context.createAnalyser();
	
	// object which holds all the nodes
	var nodes = {};

	//add nodes
	nodes.filter = context.createBiquadFilter();  
	nodes.filterHigh = context.createBiquadFilter();
	nodes.volume = context.createGain();
	nodes.delay = context.createDelay();
	nodes.feedbackGain = context.createGain();

	// Connect all the nodes together
	nodes.filter.connect(nodes.volume);
	nodes.filterHigh.connect(nodes.filter);
	nodes.filter.connect(nodes.delay);
	nodes.delay.connect(nodes.feedbackGain);
	nodes.feedbackGain.connect(nodes.volume);
	nodes.feedbackGain.connect(nodes.delay);
	nodes.volume.connect(context.destination);

	//Create initial oscillator
	oscillator = context.createOscillator();
	oscillator2 = context.createOscillator();
	oscillator.type = "sawtooth";
	oscillator2.type = "square";
	oscillator.connect(nodes.filterHigh);
	oscillator2.connect(nodes.filterHigh);
	oscillator.frequency.value = 220.00;
	oscillator2.frequency.value = oscillator.frequency.value * 2

	nodes.delay.delayTime.value = .212;
	nodes.feedbackGain.gain.value = .4;
	nodes.volume.gain.value = .5;
	nodes.filter.frequency.type = "lowpass";

	// drawSpectrum();

	// array of all available frequencies

	//var freqs = [220.000, 233.082, 246.942, 261.626, 277.183, 293.665, 311.127, 329.628, 349.228, 369.994, 391.995, 415.305]

    Leap.loop(function(frame) {

      frame.hands.forEach(function(hand, index) {
        positions = hand.screenPosition();
        var freqStep = (Math.floor((positions[0] / freqs.length) % freqs.length));
		oscillator.frequency.value = freqs[freqStep];
		oscillator2.frequency.value = freqs[freqStep + 4];
		vibrato(freqs[freqStep]);
		nodes.filter.frequency.value = (positions[1] + 100) * 10;
		nodes.filterHigh.frequency.value = (positions[2] + 100) * 10;
		console.log(positions[1]);
		console.log(positions[2]);
      });

    }).use('screenPosition', {scale: 0.25});

	playButton.onclick = function() {
		oscillator.noteOn(0);
		oscillator2.noteOn(0);
		console.log("playing");
	}

	vibrato = function(frequency) {
		var top = frequency + 10;
		var bottom = frequency - 10;
		var interval = 3;
		clearInterval(vibratoRunning);
		vibratoRunning = setInterval(function() {
				oscillator.frequency.value += interval;
				oscillator2.frequency.value += interval;
				if(oscillator.frequency.value > top || oscillator.frequency.value < bottom) {
					interval *= -1;
				}
		}, 10)

	}

}	
