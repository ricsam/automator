

// import "babel-polyfill";

import * as robot from "robotjs";

var getRandomInt = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


var running = false;
let loop_count = 0;

var _settings = {
	iterations: 0,
	min_frequency: 0,
	max_frequency: 0,
	doneCaller: () => {}
};

let _resetSettings = () => {

	_settings.iterations = 0;
	_settings.min_frequency = 0;
	_settings.max_frequency = 0;
	loop_count = 0;

};


var loop = () => {
	setTimeout( () => {

		if ( ! running ) return false;

		if (loop_count >= _settings.iterations) {
			_settings.doneCaller();
			return stop();
		}

		loop_count++;

		robot.mouseClick();

		loop();

	}, getRandomInt(_settings.min_frequency * 1000, _settings.max_frequency * 1000));
};


export function start() {

	if (running) return;

	running = true;
	loop();
}

export function stop() {
	if ( ! running ) return;

	running = false;
	_resetSettings();
}

export function set(ob) {
	for (let key in ob) { if (ob.hasOwnProperty(key)) {
		_settings[key] = ob[key];
	}}
}




