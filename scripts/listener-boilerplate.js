import {globalShortcut, screen} from 'electron';
import * as auto from './resources/auto'

var log;
var hasQuit;
var _kill;
var _pause;
var _running;
let _run_state_interval


let _bond_keys = [];
function _bindKey(key, cb, message = '') {

	globalShortcut.register(key, cb);
	_bond_keys.push(key);
	log('Is sucessfully mapping ' + key + message + ': ' + globalShortcut.isRegistered(key));
}

function runState() { return new Promise((resolve, reject) => {
	if (_kill) {
		reject();
	} else if (_pause) {
		_run_state_interval = setInterval(() => {
			if (!_pause) {
				clearInterval(_interval);
				log('Continuing the script');
				resolve();
			}
		}, 1000);
	} else {
		resolve();
	}
})}


function launch(settings) {
	_kill = false;
	_pause = false;
	_running = false;

	log('The data has been set.');

	_bindKey('F1', () => {

		if (_running) return log('The script is already running!');

		_running = true;

		log('Starting the script...');


		auto.loop(Number(0), function () {
			// Script loop code!
		})()
		.then(() => {
			log('Iterations done!');

			resetApplicationState();
		})


	}, ' to starting the script');

	_bindKey('F2', () => {

		if (_pause) {
			log('Un-pausing the script...');
		} else {
			log('Pausing the script...');
		}

		_pause = !_pause;
	}, ' to pausing the script');

	_bindKey('Esc', function () {
		resetApplicationState();
	}, ' to Quit');

}
function resetApplicationState() {

	clearInterval(_run_state_interval);

	_kill = true;
	_running = false;

	_bond_keys.forEach((key) => {
		globalShortcut.unregister(key);
		log(`Is sucessfully un-mapping ${key}: ` + !globalShortcut.isRegistered(key));
	});
	_bond_keys = [];
	hasQuit();
}



export function listener(event, action, settings) {

	log = ((sender)=>{return (msg) => {
		sender.send('NAME.listener', 'log', msg)
	}})(event.sender);

	hasQuit = ((sender)=>{return () => {
		sender.send('NAME.listener', 'post-quit');
	}})(event.sender);

	switch (action) {
		case 'launch':
			launch(settings);
			break;
		case 'quit':
			resetApplicationState();
			break;
	}

}