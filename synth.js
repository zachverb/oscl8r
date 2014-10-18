window.onload = function() {	
	var context = new webkitAudioContext();
	var playButton = document.getElementById("playButton");

	var positions;
	var vibratoInterval;
	var arpInterval;
	var vibratoIsRunning = false;
	var arpeggiating = false;
	var prevFreqStep = -1;

	var arpOscillator = false;
	var arpOscillator2 = false;
	// var analyser = context.createAnalyser();
	
	// object which holds all the nodes
	var nodes = {};

	var spheres = {};

	var riggedHandPlugin;


	//add nodes
	nodes.filter = context.createBiquadFilter();  
	nodes.filterHigh = context.createBiquadFilter();
	nodes.volume = context.createGain();
	nodes.delay = context.createDelay();
	nodes.feedbackGain = context.createGain();

	// arpeggiator nodes
	nodes.arpFilter1 = context.createBiquadFilter();
	nodes.arpFilter2 = context.createBiquadFilter();
	nodes.arpVolume = context.createGain();
	nodes.arpVolume.connect(context.destination);
	nodes.arpDelay = context.createDelay();
	nodes.arpFeedbackGain = context.createGain();

	// Connect all the nodes together
	nodes.filter.connect(nodes.volume);
	nodes.filterHigh.connect(nodes.filter);
	
	nodes.arpFilter2.connect(nodes.arpFilter1);


	nodes.filter.connect(nodes.delay);
	nodes.delay.connect(nodes.feedbackGain);
	nodes.feedbackGain.connect(nodes.volume);
	nodes.feedbackGain.connect(nodes.delay);
	nodes.volume.connect(context.destination);

	nodes.arpFilter1.connect(nodes.arpDelay);
	nodes.arpDelay.connect(nodes.arpFeedbackGain);
	nodes.arpFeedbackGain.connect(nodes.arpVolume);
	nodes.arpFeedbackGain.connect(nodes.arpDelay);

	//Create initial oscillator
	oscillator = context.createOscillator();
	oscillator2 = context.createOscillator();
	oscillator3 = context.createOscillator();
	oscillator.type = "sawtooth";
	oscillator2.type = "sawtooth";
	oscillator3.type = "sawtooth";
	oscillator.connect(nodes.filterHigh);
	oscillator2.connect(nodes.filterHigh);
	oscillator3.connect(nodes.filterHigh);

	


	// initial settings for nodes
	nodes.delay.delayTime.value = .212;
	nodes.feedbackGain.gain.value = .4;
	nodes.filter.frequency.type = "lowpass";
	nodes.filterHigh.frequency.type = "highpass";


	// arp initials
	nodes.arpDelay.delayTime.value = .8;
	nodes.arpFeedbackGain.gain.value = .4;
	nodes.arpFilter1.frequency.type = "lowpass";
	nodes.arpFilter2.frequency.type = "highpass";
	
	// set the notes and turn them on
	oscillator.frequency.value = major[24];
	oscillator2.frequency.value = major[27];
	oscillator3.frequency.value = major[29];
	oscillator.noteOn(0);
	oscillator2.noteOn(0);
	oscillator3.noteOn(0);

	arpOscillatorSetup = function(frequency) {
		arpOscillator = context.createOscillator();
		arpOscillator2 = context.createOscillator();
		arpOscillator.type = "square";
		arpOscillator2.type = "square";
		arpOscillator.connect(nodes.arpFilter2);
		arpOscillator2.connect(nodes.arpFilter2);
		arpOscillator.frequency.value = frequency;
		arpOscillator2.frequency.value = frequency;
		arpOscillator.noteOn(0);
		arpOscillator2.noteOn(0)
		console.log("hello?");
	}

	// create arpeggio oscillator
	nodes.volume.gain.value = 0;
	nodes.arpVolume.gain.value = 0;


	// Basically a constant event listener for Leap
    Leap.loop(function(frame) {
	   
    	if((frame.hands.length >= 1 && frame.hands[0].type == "left") || (frame.hands.length > 1 && frame.hands[1].type == "left")) {
    		nodes.volume.gain.value = 0.5;
    	} else {
    		nodes.volume.gain.value = 0;
    	}
    	if((frame.hands.length >= 1 && frame.hands[0].type == "right") || (frame.hands.length > 1 && frame.hands[1].type == "right")) {
    		nodes.arpVolume.gain.value = 0.2;
    	} else {
    		nodes.arpVolume.gain.value = 0;
    		if(arpeggiating) {
				clearInterval(arpInterval);
				arpeggiating = false;
			}
    	}
      	// foreach that is always listening for hand motions
		frame.hands.forEach(function(hand, index) {
			var handMesh = hand.data('riggedHand.mesh');

	        var screenPosition = handMesh.screenPosition(
	          hand.palmPosition,
	          riggedHandPlugin.camera
	        );

	        positions = hand.screenPosition();
	        type = hand.type;
	        var freqStep = (Math.floor((positions[0] / major.length) % major.length));
	        var y = (-1 * (positions[1]) * 20) + 3000;
	        var z = (-1 * (positions[2]) * 20) + 3000;
	        if(type == "left") {
				if(hand.roll() >= 1) {
					if(!vibratoIsRunning) {
						vibrato(major[freqStep]);
					}
				} else {
					oscillator.frequency.value = major[freqStep];
					oscillator2.frequency.value = major[freqStep + 3];
					oscillator3.frequency.value = major[freqStep + 5];
					vibratoIsRunning = false;
					clearInterval(vibratoInterval);
				}
				nodes.filter.frequency.value = y;
				nodes.filterHigh.frequency.value = z;
			}
			if(type == "right") {
				(freqStep -12 > 0) ? freqStep -= 12 : freqStep = 0;
				arpeggiate(freqStep);

				nodes.arpFilter1.frequency.value = y;
				nodes.arpFilter2.frequency.value = z;
			}
	    });

    }).use('screenPosition', {scale: 0.75})
	.use('riggedHand')
    .use('handEntry')
		

	// basic vibrato function
	vibrato = function(frequency) {
		vibratoIsRunning = true;
		var top = frequency + 10;
		var bottom = frequency - 10;
		var interval = 3;
		vibratoInterval = setInterval(function() {
				oscillator.frequency.value += interval;
				oscillator2.frequency.value += interval;
				oscillator3.frequency.value += interval;
				if(oscillator.frequency.value > top || oscillator.frequency.value < bottom) {
					interval *= -1;
				}
		}, 10)

	}

	arpeggiate = function(freqStep) {
		if(prevFreqStep != freqStep) {
			if(arpeggiating) {
				clearInterval(arpInterval);
				arpeggiating = false;
			}
			var direction = 1;
			arpeggiating = true;
			arpInterval = setInterval(function() {
				if(freqStep + direction >= (majorArp.length - 2) || freqStep + direction <= 0) {
					direction *= -1;
				}
				if(arpOscillator != false || arpOscillator2 != false) {
					arpOscillator.disconnect();
					arpOscillator2.disconnect();
				}
				freqStep+=direction;
				makeTriad(freqStep);
				arpOscillatorSetup(majorArp[freqStep]);
			}, 70)
			prevFreqStep = freqStep;
		}
	}

	riggedHandPlugin = Leap.loopController.plugins.riggedHand;

}
	
