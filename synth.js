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
	oscillator3 = context.createOscillator();
	oscillator.type = "sawtooth";
	oscillator2.type = "square";
	oscillator3.type = "square";
	oscillator.connect(nodes.filterHigh);
	oscillator2.connect(nodes.filterHigh);
	oscillator3.connect(nodes.filterHigh);

	// initial settings for nodes
	nodes.delay.delayTime.value = .212;
	nodes.feedbackGain.gain.value = .4;
	nodes.filter.frequency.type = "lowpass";
	nodes.filter.frequency.type = "highpass";
	oscillator.frequency.value = major[24];
	oscillator2.frequency.value = major[27];
	oscillator3.frequency.value = major[29];
	oscillator.noteOn(0);
	oscillator2.noteOn(0);
	oscillator3.noteOn(0);
	nodes.volume.gain.value = 0;


	// Basically a constant event listener for Leap
    Leap.loop(function(frame) {

      	if(frame.hands.length == 0) {
      		nodes.volume.gain.value = 0;
      	} else {
      		nodes.volume.gain.value = .5;
      	}
      	// foreach that is always listening for hand motions
		frame.hands.forEach(function(hand, index) {
	        positions = hand.screenPosition();
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
			var sphere = ( spheres[index] || (spheres[index] = new Sphere()) );
   			sphere.setTransform(hand.screenPosition(), hand.roll());
	    });

    }).use('screenPosition', {scale: 0.25});
		

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

	var Sphere = function() {

		var sphere = this;
		var img = document.createElement('img');
		img.src = 'sphere-01.svg';
		img.style.position = 'absolute';
		img.onload = function () {
			sphere.setTransform([window.innerWidth/2,window.innerHeight/2], 0);
			document.body.appendChild(img);
		}

		sphere.setTransform = function(position, rotation) {

			img.style.left = position[0] - img.width  / 2 + 'px';
			img.style.top  = position[1] - img.height / 2 + 'px';

			img.style.transform = 'rotate(' + -rotation + 'rad)';

			img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
			img.style.OTransform = img.style.transform;

		};

	};

	spheres[0] = new Sphere();
	Leap.loopController.setBackground(true);

}	
