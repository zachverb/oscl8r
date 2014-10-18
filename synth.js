window.onload = function() {	
	if('webkitAudioContext' in window) {
		var context = new webkitAudioContext();
	}
	var playButton = document.getElementById("playButton");

	// var analyser = context.createAnalyser();
	
	// object which holds all the nodes
	var nodes = {};

	// var ctx = canvas.getContext("2d");

	// var gradient = ctx.createLinearGradient(0,0,0,canvas.height);
	//     gradient.addColorStop(1,'#8CB7E1');
	//     gradient.addColorStop(0.75,'#E8E1CE');
	//     gradient.addColorStop(0.25,'#F8CB00');
	//     gradient.addColorStop(0,'#C85914');

	// ctx.fillStyle = gradient;

	// //add nodes
	// nodes.filter = context.createBiquadFilter();  
	// nodes.volume = context.createGain();
	// nodes.delay = context.createDelay();
	// nodes.feedbackGain = context.createGain();

	// // Connect all the nodes together
	// nodes.filter.connect(nodes.volume);
	// nodes.filter.connect(nodes.delay);
	// nodes.delay.connect(nodes.feedbackGain);
	// nodes.feedbackGain.connect(nodes.volume);
	// nodes.feedbackGain.connect(nodes.delay);

	//Create initial oscillator
	oscillator = context.createOscillator();
	oscillator.connect(context.destination);
	oscillator.frequency.value = 65.406;

	// analyser.smoothingTimeConstant = 0.8;
	// analyser.fftSize = 512;

	// drawSpectrum();

	// array of all available frequencies
	// var freqs = [65.406, 69.296, 73.416, 77.782, 82.407, 87.31, 92.50, 98.00, 103.83, 110.00, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94, 261.63, 277.18, 293.67, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.26, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53, 2093.00];

	playButton.onclick = function() {
		oscillator.noteOn(0);
		console.log("playing");
	}

}	
