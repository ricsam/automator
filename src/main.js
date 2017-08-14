import electron from 'electron'
const {app,BrowserWindow, globalShortcut} = electron

import * as path from 'path'

import './script-import'



let mainWindow


console.log('Initializing...\n');


function initialize () {

	const {width: screen_width, height: screen_height} = electron.screen.getPrimaryDisplay().size,
		window_width = 800,
		window_height = 40;


	// mainWindow = new BrowserWindow({
	// 	width: window_width,
	// 	height: window_height,
	// 	x: screen_width - window_width,
	// 	y: screen_height - window_height,
	// 	frame: false,
	// 	resizable: false,
	// 	alwaysOnTop: true,
	// 	focusable: false,
	// 	transparent: true
	// })

	mainWindow = new BrowserWindow({
		width: 1200,
		height: 640 
	});


	mainWindow.loadURL(`file://${path.join( __dirname, '../')}/index.html`);

	mainWindow.openDevTools(); 


}

app.on('ready', initialize)


app.on('will-quit', function () {
	// Unregister a shortcut.
	//globalShortcut.unregister('F1');

	// Unregister all shortcuts.
	globalShortcut.unregisterAll();

	console.log('\nEnd of process')
});

