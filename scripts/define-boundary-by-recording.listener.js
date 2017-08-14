import * as robot from "robotjs";
import {globalShortcut, screen, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';

var log;
var hasQuit;
var win;

let _bond_keys = [];
function _bindKey(key, cb, message = '') {

	globalShortcut.register(key, cb);
	_bond_keys.push(key);
	log('Is sucessfully mapping ' + key + message + ': ' + globalShortcut.isRegistered(key));
}

function launch() {


	ipcMain.on('screen-marker-points', (event, arg) => {
		if (arg === 'loaded') {
			setBindings();
		}
	});

	// win = new BrowserWindow();
	win = new BrowserWindow({frame: false, transparent: true});
	// win.setIgnoreMouseEvents(true);
	win.setFullScreen(true);
	win.setAlwaysOnTop(true);
	win.setMenuBarVisibility(false);
	win.loadURL(`file://${path.join( __dirname, 'screen-marker.html')}`);

	// win.openDevTools(); 
	// win.openDevTools(); 



}

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

function setBindings() {
	
	let _stored = [];

	_bindKey('Space', function () {
		let ob = screen.getCursorScreenPoint();
		let {x, y} = ob;

		let is_instersecting = false;

		if (_stored.length >= 3) {
			
			let line_a = [_stored[_stored.length - 1].x, _stored[_stored.length - 1].y, x, y],
				line_b = [_stored[0].x, _stored[0].y, x, y];

			for (let i = 0, line_x; i < _stored.length - 1; i++) {
				line_x = [_stored[i].x, _stored[i].y, _stored[i + 1].x, _stored[i + 1].y];

				if (line_intersects(...line_a, ...line_x) && i !== _stored.length - 2) {
					is_instersecting = true;
				}
				if (line_intersects(...line_b, ...line_x) && i >= 1) {
					is_instersecting = true;
				}
			}
		}

		if (is_instersecting) {
			return;
		}

		win.webContents.send('screen-marker-points', 'add', {
			x: x,
			y: y
		});

		_stored.push(ob);

		if (_stored.length === 1) {
			log('Stored: 1');
		} else {
			let chew = (_stored.length - 1).toString().replace(/./gi, '<<');
			log(`${chew}<${_stored.length}`);
		}

	}, ' to print points');

	_bindKey('Enter', function () {

		if (_stored.length <= 2) {
			return;
		}

		log(JSON.stringify(_stored));
		_stored = [];
		win.webContents.send('screen-marker-points', 'reset');

	}, ' to save pointer location');

	_bindKey('Esc', function () {
		resetApplicationState();
	}, ' to Quit');

}


function resetApplicationState() {

	if (win) {
		win.destroy();
	}

	_bond_keys.forEach((key) => {
		globalShortcut.unregister(key);
		log(`Is sucessfully un-mapping ${key}: ` + !globalShortcut.isRegistered(key));
	});
	_bond_keys = [];

	hasQuit();
}



export function listener(event, action, settings) {

	log = ((sender)=>{return (msg) => {
		sender.send('define-boundary-by-recording.listener', 'log', msg)
	}})(event.sender);

	hasQuit = ((sender)=>{return () => {
		sender.send('define-boundary-by-recording.listener', 'post-quit');
	}})(event.sender);

	switch (action) {
		case 'launch':
			launch();
			break;
		case 'quit':
			resetApplicationState();
			break;
	}

}