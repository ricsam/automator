
import electron from 'electron';
import React from 'react';
import lqButtons from './lqbuttons'

const { ipcRenderer } = electron;




export class Controls extends lqButtons {

	constructor(props) {

		super(props);

		this.title = 'Define boundary by recording';

		ipcRenderer.on('define-boundary-by-recording.listener', (event, action, message) => {
			if (action === 'log') {
				this.log(message);
			} else if (action === 'post-quit') {
				super.quit();
				this.log('Application has shutdown!');
			}
		});		

	}


	launch() {
		super.launch();
		this.log('Application is launching...');
		ipcRenderer.send('define-boundary-by-recording.listener', 'launch');
	}

	quit() {
		super.quit();
		this.log('Application is quiting...');
		ipcRenderer.send('define-boundary-by-recording.listener', 'quit');
	}



}