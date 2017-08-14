import * as robot from "robotjs";
import getPoint from './get-point';

// robot.setMouseDelay(2); // mouse speed
// robot.moveMouse(x, y);
// robot.moveMouseSmooth(x, y)

// robot.mouseToggle(down, left)
// sleep downtime
// robot.mouseToggle(up, left)



// robot.keyToggle(key, down);
// robot.keyToggle(key, up);


// img = robot.screen.capture(x, y, w, h);
// img.colorAt(x_in img, y_in img);
function _getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _getDownDuration() {
	return _getRandomInt(150, 350);
}


		// auto.clickAt(settings.bank)
		// .then(auto.sleep(2000))
		// .then(auto.press(settings.key))
		// .then(auto.loop(3, () => { return (

		// 	auto.clickAt(settings.runite)

		// 	.then(auto.sleep(500))

		// )}))




function click(cb) {

	robot.mouseToggle('down', 'left');
	setTimeout(() => {

		robot.mouseToggle('up', 'left');

		cb();

	}, _getDownDuration());

}


export function move(x, y) {

	robot.setMouseDelay(6); // mouse speed

	let mouse_pos = robot.getMousePos();

	let distance_x = Math.abs(x - mouse_pos.x),
		distance_y = Math.abs(y - mouse_pos.y),
		distance = distance_x;


	let swap = distance_y / distance_x > 1;

	if (swap) {

		distance = distance_y;
		let _x = mouse_pos.x;
		mouse_pos.x = mouse_pos.y
		mouse_pos.y = _x;

		_x = x;
		x = y;
		y = _x;
	}



	let increment = 1;

	if (x - mouse_pos.x < 0) {
		increment = -1;
	}

	let amplitude = _getRandomInt(0, 100);

	let period = Math.sqrt(Math.pow(distance_x, 2) + Math.pow(distance_y, 2)) / _getRandomInt(1, 4);

	let coefficient = 2*Math.PI / period;

	let rotation;

	let target_x,
		target_y,
		current_x,
		current_y,
		offset_y;


	target_x = x;
	target_y = y;
	current_x = mouse_pos.x;
	current_y = mouse_pos.y;

	rotation = (current_y - target_y + amplitude*(Math.sin(coefficient * target_x) - Math.sin(coefficient * current_x)))/(current_x - target_x);
	offset_y = current_y - rotation * current_x - amplitude * Math.sin(coefficient * current_x);

	for (let i = 0, speed_factor, _x, _y; Math.abs(i) <= distance; i += increment) {

		speed_factor = 0.2 + Math.pow(Math.E, 5*(Math.abs(i)/distance-1));

		robot.setMouseDelay( speed_factor * 6 ); // mouse speed

		_x = current_x + i;
		_y = offset_y + rotation * _x + amplitude * Math.sin(coefficient * _x);


		if (swap) {
			robot.moveMouse(_y, _x); 
		} else {
			robot.moveMouse(_x, _y);
		}
	}


	// robot.moveMouseSmooth(x, y);
}

export function clickAt(points) { return () => { return new Promise((resolve, reject) => {

	let {x: _x, y: _y} = robot.getMousePos();

	let {x, y} = getPoint(JSON.parse(points), _x, _y);

	if (_x !== x && _y !== y) {
		move(x, y);
	}

	click(() => {
		resolve();
	});

})}}

export function sleep(time, time_upper = null) { return () => { return new Promise((resolve, reject) => {

	if (time_upper) {
		time = _getRandomInt(time, time_upper);
	}

	setTimeout(() => {
		resolve();
	}, time);
})}}

export function press(key) { return () => { return new Promise((resolve, reject) => {



	console.log(key + " is of length " + key.length + " and of type " + typeof key + " and is array: " + Array.isArray(key));
	if (key.length === 1) {

		let shift = false;

		if ('!@#$%^&*()_+'.indexOf(key) > -1) {
			shift = true;
		}

		if (shift) { robot.keyToggle('shift', 'down'); }

		robot.keyToggle(key, 'down');
		setTimeout(() => {
			robot.keyToggle(key, 'up');

			if (shift) { robot.keyToggle('shift', 'up'); }

			resolve();
		}, _getDownDuration());

	} else {
		let index = -1;
		loop(key.length, function () {

			index++;

			return press(key[index])();

		})().then(resolve);
	}


})}}

export function loop(iterations, action) { return () => { return new Promise((resolve, reject) => {

	var l = [];

	l[0] = action();

	var i = 1;

	for (var i = 1; i < iterations; i++) {
		l[i] = l[i-1].then(action);
	}

	l[iterations - 1].then(resolve);

})}}

