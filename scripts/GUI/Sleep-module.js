
import React from 'react';
import ReactDOM from 'react-dom';
import Action from './Action-module'

export default class Sleep extends Action {

	constructor(props) {

		super(props);

		this.state = {
			min: 0,
			max: 0
		};

		this.keys = Object.keys(this.state);
	}

	render() {
		return (
			<div>
				<h4>Sleep</h4>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon1">Min-time (ms):</span>
					<input value={this.state.min} onChange={(ev) => {this.setState({min: $(ev.target).val()})}} type="text" className="form-control" placeholder="Enter number of iterations" aria-describedby="basic-addon1" />
				</div>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon2">Max-time (ms):</span>
					<input value={this.state.max} onChange={(ev) => {this.setState({max: $(ev.target).val()})}} type="text" className="form-control" placeholder="Enter number of iterations" aria-describedby="basic-addon2" />
				</div>
			</div>
		);
	}
}