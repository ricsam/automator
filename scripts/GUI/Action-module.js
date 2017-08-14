import React from 'react';

import * as _ from 'underscore'


export default class Action extends React.Component {
	constructor(props) {
		super(props);
		// dont use onSave or reference as fkn properties here!

		this.props.onSave(this.saveState, this);
	}

	componentWillReceiveProps(nextProps) {
		let new_keys = _.pick(nextProps, ...this.keys);

		if ( ! _.isEqual(new_keys, _.pick(this.state, ...this.keys)) ) {
			this.setState(new_keys);
		}
	}


	saveState() {
		return {
			data: _.pick(this.state, ...this.keys),
			reference: this.props.reference
		}
	}


}
