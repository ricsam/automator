'use babel';

import * as autoclicker from './autoclicker/script.js'
const {ipcMain, globalShortcut} = require('electron');

var log;
var quit;


var _settings = {
	doneCaller: () => {
		log('All iterations are done!');
		stop();
		quit();
	}
};


function set(ob) {
	for (let key in ob) { if (ob.hasOwnProperty(key)) {
		_settings[key] = ob[key];
	}}
}

function start() {
	log('Starting autoclicker application');

	// Register a 'F1' shortcut listener.
	globalShortcut.register('F1', () => {
		log('F1 is pressed, autoclicker is running active');

		autoclicker.set(_settings);

		autoclicker.start();
	});

	globalShortcut.register('F2', () => {
		log('F2 is pressed, autoclicker is paused');
		autoclicker.stop();
	});

	// Check whether a shortcut is registered.
	log('Is sucessfully mapping F1 to activate clicking: ' + globalShortcut.isRegistered('F1'));
	log('Is sucessfully mapping F2 to deactivate clicking: ' + globalShortcut.isRegistered('F2'));
}
function stop() {

	log('Stopping autoclicker application');

	globalShortcut.unregister('F1');
	globalShortcut.unregister('F2');

	log('Is sucessfully un-mapping F1: ' + !globalShortcut.isRegistered('F1'));
	log('Is sucessfully un-mapping F2: ' + !globalShortcut.isRegistered('F2'));

	autoclicker.stop();
}

export function listener(event, action, settings) {

	log = ((sender)=>{return (msg) => {
		sender.send('autoclicker.listener', 'log', msg)
	}})(event.sender);

	quit = ((sender)=>{return () => {
		sender.send('autoclicker.listener', 'quit');
	}})(event.sender);

	switch (action) {
		case 'start':
			start();
			break;
		case 'stop':
			stop();
			break;
		case 'set':
			set(settings);
			break;
	}

}