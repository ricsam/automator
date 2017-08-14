
import electron from 'electron';
import React from 'react';
import lqButtons from './lqbuttons'

const { ipcRenderer } = electron;




export class Controls extends lqButtons {

	constructor(props) {

		super(props);

		this.title = 'TITLE';

		ipcRenderer.on('NAME.listener', (event, action, message) => {
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
		ipcRenderer.send('NAME.listener', 'launch');
	}

	quit() {
		super.quit();
		this.log('Application is quiting...');
		ipcRenderer.send('NAME.listener', 'quit');
	}

	render() {
		return super.render(
			<div></div>
		);
	}


}