import {globalShortcut, screen} from 'electron';
import * as auto from './resources/auto'

var log;
var hasQuit;
var _kill;
var _pause;
var _running;
let _run_state_interval;

let _bond_keys = [];
function _bindKey(key, cb, message = '') {

	globalShortcut.register(key, cb);
	_bond_keys.push(key);
	log('Is sucessfully mapping ' + key + message + ': ' + globalShortcut.isRegistered(key));
}



function launch(settings) {


	_kill = false;
	_pause = false;
	_running = false;

	log('The data has been set.');


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

	globalShortcut.register('F1', function () {

		if (_running) return log('The script is already running!');

		_running = true;

		log('Starting the script...');

		auto.loop(Number(settings.iterations), function () {

			return auto.clickAt(settings.bank)().then(runState)
			.then(auto.clickAt(settings.bank)).then(runState)
			.then(auto.sleep(1000, 1500)).then(runState)
			.then(auto.press('2')).then(runState)
			.then(auto.sleep(50, 400)).then(runState)
			.then(auto.press('2')).then(runState)
			.then(auto.sleep(50, 400)).then(runState)
			.then(auto.press('2')).then(runState)
			.then(auto.sleep(100, 400)).then(runState)
			.then(auto.press('2')).then(runState)
			.then(auto.sleep(300, 800)).then(runState)
			.then(auto.loop(5, function () {
				return auto.press(settings.key)().then(runState)
				.then(auto.clickAt(settings.runite)).then(runState)
				.then(auto.sleep(100, 400)).then(runState)
			})).then(runState)

		})()

		.then(() => {
			log('Iterations done!');

			resetApplicationState();
		})
	});
	globalShortcut.register('F2', function () {
		if (_pause) {
			log('Un-pausing the script...');
		} else {
			log('Pausing the script...');
		}

		_pause = !_pause;

		// resetApplicationState();
	});

	log('Is sucessfully mapping F1 to starting the script: ' + globalShortcut.isRegistered('F1'));
	log('Is sucessfully mapping F2 to pausing the script: ' + globalShortcut.isRegistered('F2'));
	_bindKey('Esc', function () {
		resetApplicationState();
	}, ' to Quit');
}
function resetApplicationState() {

	clearInterval(_run_state_interval);

	_kill = true;
	_running = false;
	

	globalShortcut.unregister('F1');
	log('Is sucessfully un-mapping F1: ' + !globalShortcut.isRegistered('F1'));
	globalShortcut.unregister('F2');
	log('Is sucessfully un-mapping F2: ' + !globalShortcut.isRegistered('F2'));

	_bond_keys.forEach((key) => {
		globalShortcut.unregister(key);
		log(`Is sucessfully un-mapping ${key}: ` + !globalShortcut.isRegistered(key));
	});
	_bond_keys = [];
	hasQuit();
}



export function listener(event, action, settings) {

	log = ((sender)=>{return (msg) => {
		sender.send('superheating.listener', 'log', msg)
	}})(event.sender);

	hasQuit = ((sender)=>{return () => {
		sender.send('superheating.listener', 'post-quit');
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