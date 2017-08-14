
import electron from 'electron';
import React from 'react';
import lqButtons from './lqbuttons'
import _ from 'underscore';

const { ipcRenderer } = electron;




export class Controls extends lqButtons {

	constructor(props) {

		super(props);

		this.title = 'Superheating';

		ipcRenderer.on('superheating.listener', (event, action, message) => {
			if (action === 'log') {
				this.log(message);
			} else if (action === 'post-quit') {
				super.quit();
				this.log('Application has shutdown!');
			}
		});

		this.params = ['bank', 'runite', 'key', 'iterations'];

		this.params.forEach((key) => {
			this.state[key] = '';

			this[`${key}Handler`] = ( function (key, ev) { 

				let ob = {};
				ob[key] = ev.target.value;
				this.setState(ob);

			}).bind(this, key);
		});

	}

	save() {
		window.localStorage.setItem('superheating-state', JSON.stringify(_.pick(this.state, this.params)));
		return true;
	}

	launch() {

		if (!(this.state.bank.length > 0 && this.state.runite.length > 0 && this.state.key.length > 0)) {
			return;
		}

		super.launch();
		this.log('Application is launching...');
		this.save();
		ipcRenderer.send('superheating.listener', 'launch', _.pick(this.state, this.params));
	}

	quit() {
		super.quit();
		this.log('Application is quiting...');
		ipcRenderer.send('superheating.listener', 'quit');
	}

	useLast(ev) {
		let data = JSON.parse(window.localStorage.getItem('superheating-state'));
		if ( data ) {
			this.setState(data);
		}
	}

	render() {
		return super.render(
			<div>
				<div className="input-group">
					<button type="button" className="btn btn-info" onClick={this.useLast.bind(this)}>Use last settings...</button>
				</div>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon1">Bank location:</span>
					<input value={this.state.bank} onChange={this.bankHandler.bind(this)} type="text" className="form-control" placeholder="Enter JSON square data" aria-describedby="basic-addon1" />
				</div>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon2">Runite location:</span>
					<input value={this.state.runite} onChange={this.runiteHandler.bind(this)} type="text" className="form-control" placeholder="Enter JSON square data" aria-describedby="basic-addon2" />
				</div>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon3">Number of iterations:</span>
					<input value={this.state.iterations} onChange={this.iterationsHandler.bind(this)} type="text" className="form-control" placeholder="Enter JSON square data" aria-describedby="basic-addon3" />
				</div>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon4">Superheat key-bind:</span>
					<input value={this.state.key} onChange={this.keyHandler.bind(this)} type="text" className="form-control" placeholder="Enter the key" aria-describedby="basic-addon4" />
				</div>
			</div>
		);
	}



}