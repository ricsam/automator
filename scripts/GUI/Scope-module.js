import React from 'react';
import ReactDOM from 'react-dom';
import Sleep from './Sleep-module';
import PressKeys from './PressKeys-module';
import Loop from './Loop-module';
import ActionWrapper from './ActionWrapper-module';
import ClickInBoundary from './ClickInBoundary-module.js'

import * as DB from './DB-api.js';

import * as uuid from 'uuid';

import * as _ from 'underscore'

function getTextComponent(text) {
	return class TextComponent extends React.Component {
		render() {
			return <h4>{text}</h4>
		}
	}
}

export default class Scope extends React.Component {
	constructor(props) {
		super(props);
		this.actionHandlers = {
			sleep: Sleep,
			// clickObject: getTextComponent('Click at image object'),
			clickBoundary: ClickInBoundary,
			// moveBoundary: getTextComponent('Move mouse inside a boundary'),
			press: PressKeys,
			loop: Loop
		}


		this.addActionHandler = this.addActionHandler.bind(this)
		Object.keys(this.actionHandlers).forEach(this.addActionHandler);


		this.state = {
			actions: DB.actionMapper((action) => {

				return {
					action: this.actionHandlers[action.params.component],
					handler_name: action.params.component,
					reference: uuid.v4(),
					values: action.value
				}

			}, this.props.scope) || []
		};


		this.saveHandlers = [];


		this.identify = uuid.v4();

	}

	componentDidMount() {
		this.props.onSave(this.saveState, this);
	}

	addActionHandler(key) {

		this[`${key}Handler`] = ( function (key, ev) { 

			let scopeComponent = {
				handler_name: key,
				action: this.actionHandlers[key],
				reference: uuid.v4(),
				values: {}
			};

			this.setState({
				actions: this.state.actions.concat([scopeComponent])
			})


		}).bind(this, key);

	}

	childSaveHandler(cb, context) {
		this.saveHandlers.push(cb.bind(context));
	}

	saveState(id) {

		let action_values = {};
		this.saveHandlers.forEach((handler) => {
			let ob = handler();
			action_values[ob.reference] = ob.data;
		})

		this.state.actions.forEach((action, index) => {
			let entry_location = `GUI:${id}.action?component=${action.handler_name}&index=${index}`;

			let values = "";
			if (_.has(action_values, action.reference)) {
				values = action_values[action.reference]
			} else {
				console.warn('something went wrong in the scope child-parent mapping!');
				console.error(this.state);
				console.error(action_values);
				values = `Undefined: actions_values: ${JSON.stringify(action_values)}, this.state.actions: ${JSON.stringify(this.state.acitons)}`;
			}
			window.localStorage.setItem(entry_location, JSON.stringify(values));
		});

	}



	removeAction(key, ev) {
		this.setState({
			actions: this.state.actions.filter((v, i) => {
				return i !== key;
			})
		});


	}

	getActionsFromScope(scope) {
		return DB.actionMapper((action) => {

			return {
				action: this.actionHandlers[action.params.component],
				handler_name: action.params.component,
				reference: uuid.v4(),
				values: action.value
			}

		}, scope)
	}

	cloneOmitReference(collection) {
		return _.map(collection, (o) => {
			return _.omit(o, 'reference');
		});
	}

	// componentWillReceiveProps(next) {

	// 	let update = _.isEqual(
	// 		this.cloneOmitReference(this.getActionsFromScope(next.scope)),
	// 		this.cloneOmitReference(this.state.actions)
	// 	)



	// 	if (_.has(next.scope, 'action') && update ) {

	// 		console.log('updating', next.scope);

	// 		// this.state.actionHandlers = []; // reset action handlers

	// 		this.setState({
	// 			actions: this.getActionsFromScope(next.scope)
	// 		});

	// 	}
	// }

	componentDidUpdate(prevProps, prevState) {}



	componentWillReceiveProps(nextProps) {
		if (nextProps.update_version !== this.update_version) {
			this.setState({
				actions: DB.actionMapper((action) => {
					return {
						action: this.actionHandlers[action.params.component],
						handler_name: action.params.component,
						reference: uuid.v4(),
						values: action.value
					}

				}, nextProps.scope) || []
			});

			this.update_version = nextProps.update_version;
		}
	}

	getRenderActions() {


		let actions = this.state.actions.map((scopeComponent, index) => {
			// console.log(this.props.id);
			return (
				<scopeComponent.action
					reference={scopeComponent.reference}
					onSave={this.childSaveHandler.bind(this)}
					update_version={this.update_version}
					{...scopeComponent.values}
				/>
			)
		});


		return actions;

	}

	render() {

		let actions = this.getRenderActions();

		let wrapped_actions = actions.map((action, key) => {
			return (
				<ActionWrapper
					action={action}
					key={key}
					removeAction={this.removeAction.bind(this, key)}
				/>
			);
		});

		return (
			<div className='scope'>

				{wrapped_actions}

				<div className="btn-group">
					<button type="button" className={`btn btn-${wrapped_actions.length === 0 ? 'secondary' : 'primary'} dropdown-toggle`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Add action
					</button>
					<div className="dropdown-menu">
						<a className="dropdown-item" href="#" onClick={this.sleepHandler}>Sleep</a>
						<a className="dropdown-item" href="#" onClick={this.loopHandler}>Loop</a>
						<div className="dropdown-divider"></div>
						<a className="dropdown-item" href="#" onClick={this.clickBoundaryHandler}>Click in boundary</a>
						<a className="dropdown-item" href="#" onClick={this.pressHandler}>Press keys</a>
					</div>
				</div>
			</div>
		);
	}
}