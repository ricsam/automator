
import React from 'react';
import Action from './Action-module.js';

import * as _ from 'underscore';


import * as uuid from 'uuid';
import {getDB} from './DB-api.js'

import Scope from './Scope-module.js';

export default class Loop extends Action {

	constructor(props) {
		super(props);


		this.state = {
			iterations: this.props.iterations || 0,
			scope: getDB(this.props.child_id) || {}
		};


		this.saveHandlers = [];

		this.keys = ['iterations'];

		this.props.onSave(this.saveState, this);

	}

	iterationHandler(ev) {
		this.setState({
			iterations: Number($(ev.target).val())
		});
	}


	saveState() {

		let child_id = uuid.v4();


		this.saveHandlers.forEach((handler) => {
			handler(child_id);
		});

		return {
			data: _.extend(_.pick(this.state, ...this.keys), {child_id: child_id}),
			reference: this.props.reference
		}
	}

	childSaveHandler(cb, context) {
		this.saveHandlers.push(cb.bind(context));
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.update_version !== this.update_version || this.state.iterations !== nextState.iterations;
	}

	render() {

		this.update_version = this.props.update_version;

		let scope = getDB(this.props.child_id);


		return (
			<div>
				<h4>Loop</h4>
				<div className="input-group">
					<span className="input-group-addon" id="basic-addon1">Iterations:</span>
					<input value={this.state.iterations} onChange={this.iterationHandler.bind(this)} type="text" className="form-control" placeholder="Enter number of iterations" aria-describedby="basic-addon1" />
				</div>
				<Scope scope={scope} update_version={this.update_version} onSave={this.childSaveHandler.bind(this)} />
			</div>
		);
	}
}

