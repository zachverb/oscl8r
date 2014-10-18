window.onload = function() {	
	var context = new webkitAudioContext();
	var playButton = document.getElementById("playButton");

	var positions;
	var vibratoInterval;
	var vibratoIsRunning = false;
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

	// Connect all the nodes together
	nodes.filter.connect(nodes.volume);
	nodes.filterHigh.connect(nodes.filter);
	
	nodes.arpFilter1.connect(nodes.arpVolume);
	nodes.arpFilter2.connect(nodes.arpFilter1);

	nodes.filter.connect(nodes.delay);
	nodes.delay.connect(nodes.feedbackGain);
	nodes.feedbackGain.connect(nodes.volume);
	nodes.feedbackGain.connect(nodes.delay);
	nodes.volume.connect(context.destination);

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

	// create arpeggio oscillator
	arpOscillator = context.createOscillator();
	arpOscillator.type = "square";
	arpOscillator.connect(nodes.arpFilter2);


	// initial settings for nodes
	nodes.delay.delayTime.value = .212;
	nodes.feedbackGain.gain.value = .4;
	nodes.filter.frequency.type = "lowpass";
	nodes.filterHigh.frequency.type = "highpass";

	// arp initials
	nodes.arpFilter1.frequency.type = "lowpass";
	nodes.arpFilter2.frequency.type = "highpass";
	
	// set the notes and turn them on
	oscillator.frequency.value = major[24];
	oscillator2.frequency.value = major[27];
	oscillator3.frequency.value = major[29];
	oscillator.noteOn(0);
	oscillator2.noteOn(0);
	oscillator3.noteOn(0);
	arpOscillator.frequency.value = major[29];
	arpOscillator.noteOn(0);
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
    		nodes.arpVolume.gain.value = 0.5;
    	} else {
    		nodes.arpVolume.gain.value = 0;
    	}
      	// foreach that is always listening for hand motions
		frame.hands.forEach(function(hand, index) {
			var handMesh = hand.data('riggedHand.mesh');

	        var screenPosition = handMesh.screenPosition(
	          hand.palmPosition,
	          riggedHandPlugin.camera
	        );

	        positions = hand.screenPosition();
	        console.log(positions);
	        type = hand.type;
	        if(type == "left") {
		        var freqStep = (Math.floor((positions[0] / major.length) % major.length));
				if(hand.roll() <= -1) {
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
				nodes.filter.frequency.value = (positions[1] + 100) * 10;
				nodes.filterHigh.frequency.value = (positions[2] + 100) * 10;
			}
			if(type == "right") {
				console.log("da fuk");
		        var freqStep = (Math.floor((positions[0] / major.length) % major.length));
				console.log(freqStep);
				console.log(major[freqStep]);
				arpOscillator.frequency.value = major[freqStep];
				console.log("Hey it worked");

				nodes.arpFilter1.frequency.value = (positions[1] + 100) * 10;
				nodes.arpFilter2.frequency.value = (positions[2] + 100) * 10;
			}
			//var sphere = ( spheres[index] || (spheres[index] = new Sphere()) );
   			//sphere.setTransform(hand.screenPosition(), hand.roll());
	    });

    }).use('screenPosition', {scale: 0.5})
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

	riggedHandPlugin = Leap.loopController.plugins.riggedHand;

}	
