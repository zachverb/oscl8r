var freqs = [0, 65.406, 69.296, 73.416, 77.782, 82.407, 87.31, 92.50, 98.00, 103.83, 110.00, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94, 261.63, 277.18, 293.67, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.26, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53, 2093.00];

var major = [];

slot = 0;
while(slot <= freqs.length) {
	major.push(freqs[slot + 1]);
	major.push(freqs[slot + 3]);
	major.push(freqs[slot + 5]);
	major.push(freqs[slot + 6]);
	major.push(freqs[slot + 8]);
	major.push(freqs[slot + 10]);
	major.push(freqs[slot + 12]);
	major.push(freqs[slot + 13]);
	slot+=12;
}

var majorArp = [];

makeTriad = function(arpSlot) {
	majorArp = [];
	while(arpSlot < major.length) {
		majorArp.push(major[arpSlot]);
		majorArp.push(major[arpSlot + 2]);
		majorArp.push(major[arpSlot + 4]);
		arpSlot+=8;
	}
}

console.log(majorArp);