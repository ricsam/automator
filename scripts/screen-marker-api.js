
const {ipcRenderer} = require('electron');


var points = [];



function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

	var s1_x, s1_y, s2_x, s2_y;
	s1_x = p1_x - p0_x;
	s1_y = p1_y - p0_y;
	s2_x = p3_x - p2_x;
	s2_y = p3_y - p2_y;

	var s, t;
	s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

	return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}

$(function () {

	var reset = false;

	var buffer = document.getElementById('buffer');


	buffer.width = screen.width;
	buffer.height = screen.height;


	var c = buffer.getContext('2d');

	var mouse = {
		x: 0, y: 0
	};

	$(window).on('mousemove', (ev) => {
		mouse.x = ev.clientX;
		mouse.y = ev.clientY;
	});


	function update() {

		c.clearRect(0, 0, screen.width, screen.height);

		if (points.length < 1) { return; }



		if ( reset ) {
			c.strokeStyle = 'green';
		} else {
			c.strokeStyle = 'black';
		}

		if (reset) {
			c.lineWidth = 4;
		} else {
			c.lineWidth = 2;
		}
		c.beginPath();
			c.moveTo(points[0].x, points[0].y);

			points.slice(1).forEach((point) => {
				c.lineTo(point.x, point.y);
			});
		// c.closePath();
		c.stroke();




		let is_instersecting = false,
			line_a = [points[points.length - 1].x, points[points.length - 1].y, mouse.x, mouse.y],
			line_b = [points[0].x, points[0].y, mouse.x, mouse.y]

		if (points.length >= 3 && ! reset) {
			for (let i = 0, line_x; i < points.length - 1; i++) {
				line_x = [points[i].x, points[i].y, points[i + 1].x, points[i + 1].y];

				if (line_intersects(...line_a, ...line_x) && i !== points.length - 2) {
					is_instersecting = true;
				}
				if (line_intersects(...line_b, ...line_x) && i >= 1) {
					is_instersecting = true;
				}
			}
		}

		if (is_instersecting) {
			c.strokeStyle = 'red';
		} else if ( reset ) {
			c.strokeStyle = 'green';
		} else {
			c.strokeStyle = 'blue';
		}

		c.beginPath();
			c.moveTo(points[points.length - 1].x, points[points.length - 1].y);
			if (  ! reset ) {
				c.lineTo(mouse.x, mouse.y);
			}
			c.lineTo(points[0].x, points[0].y);
		// c.closePath();
		c.stroke();

	}


	(function tick() {

		update();

		requestAnimationFrame(tick);

	})()

	ipcRenderer.on('screen-marker-points', (event, message, data) => {

	 	console.log(message, data);

		if (message === 'add') {
			points.push(data);
		} else if (message === 'reset') {
			reset = true;
			setTimeout(function () {
				reset = false;
				points = [];
			}, 1000)
		}
	});



	ipcRenderer.send('screen-marker-points', 'loaded');


});