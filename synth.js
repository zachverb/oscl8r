window.onload = function() {	
	var context = new webkitAudioContext();
	if(!context) {
		alert("Your browser does not support this app! Please use a webkit supported browser.")
	}
	var playButton = document.getElementById("playButton");

	var positions;
	var vibratoInterval;
	var arpInterval;
	var vibratoIsRunning = false;
	var arpeggiating = false;
	var prevFreqStep = -1;
	var leap = false
	var arpOscillator = false;
	var arpOscillator2 = false;
	// var analyser = context.createAnalyser();
	
	// object which holds all the nodes
	var nodes = {};

	var spheres = {};

	var riggedHandPlugin;


	// add fiter, volume, delay chord nodes
	nodes.lowPassC = context.createBiquadFilter();  
	nodes.highPassC = context.createBiquadFilter();
	
	nodes.volume = context.createGain();
	
	nodes.delay = context.createDelay();
	nodes.feedbackGain = context.createGain();

	// add filters, volume, delay arpeggiator nodes
	nodes.lowPassArp = context.createBiquadFilter();
	nodes.highPassArp = context.createBiquadFilter();
	
	nodes.arpVolume = context.createGain();
	nodes.arpVolume.connect(context.destination);
	
	nodes.arpDelay = context.createDelay();
	nodes.arpFeedbackGain = context.createGain();


	// Connect chord filter node
	nodes.lowRassC.connect(nodes.volume);
	nodes.highPassC.connect(nodes.lowPassC);
	nodes.lowPassC.connect(nodes.delay);
	nodes.delay.connect(nodes.feedbackGain);
	nodes.feedbackGain.connect(nodes.volume);
	nodes.feedbackGain.connect(nodes.delay);
	nodes.volume.connect(context.destination);

	//fonnect arpeggiator filters
	nodes.highPassArp.connect(nodes.lowPassArp);
	nodes.lowPassArp.connect(nodes.arpDelay);
	nodes.arpDelay.connect(nodes.arpFeedbackGain);
	nodes.arpFeedbackGain.connect(nodes.arpVolume);
	nodes.arpFeedbackGain.connect(nodes.arpDelay);

	//Create initial oscillators for chord nodes
	oscillator = context.createOscillator();
	oscillator2 = context.createOscillator();
	oscillator3 = context.createOscillator();
	oscillator.type = "sawtooth";
	oscillator2.type = "sawtooth";
	oscillator3.type = "sawtooth";
	oscillator.connect(nodes.highPassC);
	oscillator2.connect(nodes.highPassC);
	oscillator3.connect(nodes.highPassC);

	


	// initial settings for nodes
	nodes.delay.delayTime.value = .212;
	nodes.feedbackGain.gain.value = .4;
	nodes.highPassC.frequency.type = "lowpass";
	nodes.highPassC.frequency.type = "highpass";


	// arp initials
	nodes.arpDelay.delayTime.value = .8;
	nodes.arpFeedbackGain.gain.value = .4;
	nodes.lowPassArp.frequency.type = "lowpass";
	nodes.highPassArp.frequency.type = "highpass";
	
	// set the notes and turn them on
	oscillator.frequency.value = major[24];
	oscillator2.frequency.value = major[27];
	oscillator3.frequency.value = major[29];
	oscillator.noteOn(0);
	oscillator2.noteOn(0);
	oscillator3.noteOn(0);


	//creates the arpeggio's oscillators
	arpOscillatorSetup = function(frequency) {
		arpOscillator = context.createOscillator();
		arpOscillator2 = context.createOscillator();
		arpOscillator.type = "square";
		arpOscillator2.type = "square";
		arpOscillator.connect(nodes.highPassArp);
		arpOscillator2.connect(nodes.highPassArp);
		arpOscillator.frequency.value = frequency;
		arpOscillator2.frequency.value = frequency;
		arpOscillator.noteOn(0);
		arpOscillator2.noteOn(0);
	}

	// createOscFull = function(frequency, type, )

	// create arpeggio oscillator
	nodes.volume.gain.value = 0;
	nodes.arpVolume.gain.value = 0;


	// Basically a constant event listener for Leap
    Leap.loop(function(frame) {

    	// Notifies user leap is connected
    	if(leap === false) {
    		leap = true;
    		$("#notice p").text("OK!");
    		$("#notice").fadeOut(2000);
    	}

    	// turns up each hand's synth's volume as they appear
    	if((frame.hands.length >= 1 && frame.hands[0].type == "left") || 
    		(frame.hands.length > 1 && frame.hands[1].type == "left")) {
    		nodes.volume.gain.value = 0.5;
    	} else {
    		nodes.volume.gain.value = 0;
    	}
    	if((frame.hands.length >= 1 && frame.hands[0].type == "right") || 
    		(frame.hands.length > 1 && frame.hands[1].type == "right")) {
    		nodes.arpVolume.gain.value = 0.2;
    	} else {
    		nodes.arpVolume.gain.value = 0;
    		if(arpeggiating) {
				clearInterval(arpInterval);
				arpeggiating = false;
			}
    	}

      	// foreach that is always listening for hand motions. Does one of these for the left and for the right.
		frame.hands.forEach(function(hand, index) {

			// prints out the hands on the canvas
			var handMesh = hand.data('riggedHand.mesh');
	        var screenPosition = handMesh.screenPosition(
	          hand.palmPosition,
	          riggedHandPlugin.camera
	        );

	        // sets up initial hand values for the hand
	        positions = hand.screenPosition();
	        type = hand.type;

	        // freqStep finds where in the array to find the related oscillator's frequency
	        // based on the X Axis
	        var freqStep = (Math.floor((positions[0] / major.length) % major.length));
	        // sets up the highpass and lowpass filter values based on hand positions.
	        var y = (-1 * (positions[1]) * 20) + 3000;
	        var z = (-1 * (positions[2]) * 20) + 3000;

	        // On Left Hand, change all the oscillator's values to a frequency related
	        // part in the freqs array. Sets the second oscilator to 3 half-steps uo,
	        // and the third oscillator to 5 half-steps up to make a diatonic triad.
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
				nodes.highPassC.frequency.value = y;
				nodes.highPassC.frequency.value = z;
			}

			// Bad code: rewrite coming. Unsure what switch does.
			// Calls the arpeggiate function, changes the filter. 
			if(type == "right") {
				(freqStep - 12 > 0) ? freqStep -= 12 : freqStep = 0;
				arpeggiate(freqStep);

				nodes.lowPassArp.frequency.value = y;
				nodes.highPassArp.frequency.value = z;
			}
	    });
		
    }).use('screenPosition', {scale: 0.75})
	.use('riggedHand')
    .use('handEntry')
		

	// basic vibrato function. Creates a loop of pitch shift up and down constantly
	//
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
				arpOscillatorSetup(majorArp[freqStep]);
			}, 70)
			prevFreqStep = freqStep;
		}
	}

	riggedHandPlugin = Leap.loopController.plugins.riggedHand;

}
	
