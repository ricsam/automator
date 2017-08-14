import React from 'react';
import Action from './Action-module';

export default class PressKeys extends Action {

	constructor(props) {
		super(props);

		this.state = {
			boundary: this.props.boundary || ''
		};


		this.keys = Object.keys(this.state);
	}

	render() {
		return (
			<div>
				<h4>Click in boundary</h4>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon1">Location:</span>
					<input value={this.state.boundary} onChange={this.keysHandler.bind(this)} type="text" className="form-control" placeholder="Enter JSON square data" aria-describedby="basic-addon1" />
				</div>
			</div>
		);
	}

	keysHandler(ev) {
		this.setState({
			boundary: $(ev.target).val()
		});
	}
}
