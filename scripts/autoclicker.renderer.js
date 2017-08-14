
import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';



const { ipcRenderer } = electron;

function start() {
	ipcRenderer.send('autoclicker.listener', 'start');
}
function stop() {
	ipcRenderer.send('autoclicker.listener', 'stop');
}
function set(settings) {
	ipcRenderer.send('autoclicker.listener', 'set', settings);
}


export class Controls extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'controls';
		this.title = 'Autoclicker';

		this.state = {
			running: false,
			min_freq: 0,
			max_freq: 0,
			iterations: 0
		};

		ipcRenderer.on('autoclicker.listener', (event, action, message) => {
			if (action === 'log') {
				this.log(message);
			} else if (action === 'quit') {
				this.setState({running: false});
			}
		});

		['minFreqHandler', 'maxFreqHandler', 'iterationHandler', 'start', 'stop'].forEach((l) => {
			this[l] = this[l].bind(this);
		});

	}
	minFreqHandler(ev) {
		this.state.min_freq = ev.target.value
	}
	maxFreqHandler(ev) {
		this.state.max_freq = ev.target.value
	}
	iterationHandler(ev) {
		this.state.iterations = ev.target.value
	}

	start() {

		if (this.state.iterations === 0 || this.state.max_freq === 0) { return false }

		this.setState({running: true});

		set({
			iterations: this.state.iterations,
			min_frequency: this.state.min_freq,
			max_frequency: this.state.max_freq
		});

		start();

	}
	stop() {

		this.setState({running: false});
		stop();


	}
	log(message) {
		this.props.log(message);
	}
	render() {
		return (
			<div>
				<button type="button" className="btn btn-success" onClick={this.start} disabled={this.state.running}>Start</button>
				<button type="button" className="btn btn-danger" onClick={this.stop} disabled={!this.state.running}>Stop</button>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon1">Iterations:</span>
					<input onChange={this.iterationHandler} type="text" className="form-control" placeholder="Enter number of iterations" aria-describedby="basic-addon1" />
				</div>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon2">Max frequency:</span>
					<input onChange={this.maxFreqHandler} type="text" className="form-control" placeholder="Enter maximum number of seconds between clicks" aria-describedby="basic-addon2" />
				</div>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon3">Min frequency:</span>
					<input onChange={this.minFreqHandler} type="text" className="form-control" placeholder="Enter minimum number of seconds between clicks" aria-describedby="basic-addon3" />
				</div>
			</div>
		);
	}

}