<script src="http://js.leapmotion.com/leap-0.6.3.min.js"></script>
<script src="Http://js.leapmotion.com/leap-plugins-0.1.3.js"></script>

var spheres = {};

Leap.loop(function(frame) {

  frame.hands.forEach(function(hand, index) {

    var sphere = ( spheres[index] || (spheres[index] = new Sphere()) );
    cat.setTransform(hand.screenPosition(), hand.roll());

  });

}).use('screenPosition', {scale: 0.25});


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
