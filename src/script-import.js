
import { glob } from 'glob';
import path from 'path'

const {ipcMain} = require('electron');


var _listeners = [];

ipcMain.on('main-channel', (event, action) => {

	switch (action) {
		case 'reset':
			console.log('reseting listeners');
			_listeners.forEach((listener, index) => {
				ipcMain.removeListener(listener.channel, listener.func);
				_listeners.splice(index, 1);
			})
			break;
	}

});

ipcMain.on('render-controls', (event, arg) => {

	glob('./scripts/*.renderer.js', (err, files) => {
		if (err) return console.log(err);

		let scripts = files.map((fpath) => {
			return path.join(__dirname, '../', fpath)
		});


		event.sender.send('render-controls', scripts);
	});
	glob('./scripts/*.listener.js', (err, files) => {
		let regex = /^\.\/scripts\/([\w.|\-]+)\.listener.js$/gi;

		files.forEach((fpath) => {

			let result = (new RegExp(regex)).exec(fpath);
			if ( ! result) return;

			let id = result[1];

			let listener = {
				channel: `${id}.listener`,
				func: require(path.join(__dirname, '../', fpath)).listener
			};


			ipcMain.on(listener.channel, listener.func);

			_listeners.push(listener);

		});

	});
});


