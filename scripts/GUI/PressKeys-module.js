import React from 'react';
import Action from './Action-module';

export default class PressKeys extends Action {

	constructor(props) {
		super(props);

		this.state = {
			keys: this.props.keys || ''
		};


		this.keys = Object.keys(this.state);
	}

	render() {
		return (
			<div>
				<h4>Press key</h4>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon1">Keys:</span>
					<input value={this.state.keys} onChange={this.keysHandler.bind(this)} type="text" className="form-control" placeholder="Enter number of iterations" aria-describedby="basic-addon1" />
				</div>
			</div>
		);
	}

	keysHandler(ev) {
		this.setState({
			keys: $(ev.target).val()
		});
	}
}
