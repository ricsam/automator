
import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import lqButtons from './lqbuttons'

import * as uuid from 'uuid';

import * as _ from 'underscore'

import Scope from './GUI/Scope-module.js'

const { ipcRenderer } = electron;

import * as DB from './GUI/DB-api.js';


export class Controls extends lqButtons {

	constructor(props) {

		super(props);

		this.title = 'Script maker';

		ipcRenderer.on('gui.listener', (event, action, message) => {
			if (action === 'log') {
				this.log(message);
			} else if (action === 'post-quit') {
				super.quit();
				this.log('Application has shutdown!');
			}
		});	

		this.state = {
			id: uuid.v4(),
			name: '',
			update_version: 0,
			saveHandlers: [],
			scope: {} // clone of one storage entry
		}


	}

	createNewScope() {

	}




	launch() {
		super.launch();
		this.log('Application is launching...');

		// console.log(current_entry);

		// window.refref = current_entry;

		let id = uuid.v4();


		// save to localStorage

		this.state.saveHandlers.forEach((handler) => {
			handler(id);
		});

		// resources/auto.js mappings to the api
		let auto_js_type_mappings = {
			clickBoundary: 'clickAt',
			loop: 'loop',
			press: 'press',
			sleep: 'sleep'
		};





		let _to_delete = [];
		function getHierarchicalScope(id) {

			let data = DB.actionMapper((action) => {

				let ob = {
					type: auto_js_type_mappings[action.params.component]
				}

				if (ob.type === 'loop') {
					ob.children = getHierarchicalScope(action.value.child_id);
					// console.log(action.value);
					// console.log(action.value)
				}


				switch (ob.type) {

					case 'clickAt':
						ob.args = [action.value.boundary];
						break;

					case 'loop':
						ob.args = [Number(action.value.iterations) + 1];
						break;

					case 'press':
						ob.args = [action.value.keys];
						break;

					case 'sleep':
						ob.args = [action.value.min, action.value.max];
						break;

				}

				return ob;

			}, DB.getDB(id));

			_to_delete.push(id);

			return data;
		}

		let hierarchical_scope = getHierarchicalScope(id);


		_to_delete.forEach((_id) => {
			DB.deleteEntry(_id);
		});



		console.log(hierarchical_scope);
		
		
		ipcRenderer.send('gui.listener', 'launch', hierarchical_scope);
	}

	quit() {
		super.quit();
		this.log('Application is quiting...');
		ipcRenderer.send('gui.listener', 'quit');
	}

	saveState(ev) {

		// let id = this.getIdByName(this.state.name);

		// if ( ! id ) {
			// id = uuid.v4();
		// }

		// this.setState({
		// 	scope: {},
		// }, () => {

		// })

		let old_id = DB.getEntryIdByName(this.state.name);

		let id = uuid.v4();
		this.saveToDB(id);

		this.setState({
			scope: DB.getDB(id),
			update_version: this.state.update_version + 1
		});

		if (old_id) {
			DB.deleteEntry(old_id);
		}

		this.setDropDownItems();


	}
	saveToDB(entry_id) {

		this.state.saveHandlers.forEach((handler) => {
			handler(entry_id);
		});

		window.localStorage.setItem(`GUI:${entry_id}.name`, this.state.name);
	}
	stateNameHandler(ev) {

		let value = $(ev.target).val();

		this.setState({
			name: value,
			scope: {}
		});

	}


	saveHandler(cb, context) {
		this.setState({
			saveHandlers: this.state.saveHandlers.concat([cb.bind(context)])
		})

	}



	loadScript(id, ev) {

		this.setState({
			name: $(ev.target).text(),
			update_version: this.state.update_version + 1,
			scope: _.extend(DB.getDB(id), {unique: uuid.v4()}) // unique to make it update
		});
	}




	deleteHandler() {
		let id = DB.getEntryIdByName(this.state.name);

		if ( ! id ) {
			return;
		}

		DB.deleteEntry(id);

		this.setState({
			name: '',
			scope: {}
		});

		this.setDropDownItems();
	}

	setDropDownItems() {

		let db = DB.getDB();

		let dropdown_items = [];
		let i = 0;
		for (let key in db) {

			let val = db[key];
			if (val.hasOwnProperty('name')) {

				dropdown_items.push(
					<a onClick={this.loadScript.bind(this, key)} className="dropdown-item" href="#" key={i}>{val.name.value}</a>
				);

				i++;
				
			}

		}

		if (dropdown_items.length === 0) {
			dropdown_items.push(
				<a className="disabled dropdown-item" href="#" key={0}>Empty</a>
			)
		}

		this.setState({
			dropdown_items: dropdown_items
		})
	}

	componentDidMount() {
		this.setDropDownItems();
	}

	exportHandler() {

	}

	importHandler() {}

	render() {

		return super.render(

			<div className='gui-actions'>

				<div className="input-group" style={{width: 300, float: 'left', marginRight: 0}}>
					<input type="text" value={this.state.name} onChange={this.stateNameHandler.bind(this)} className="form-control" placeholder="Name" />
					<span className="input-group-btn">
						<button disabled={this.state.saveHandlers.length === 0 || this.state.name.replace(/\s/g, '') === ''} onClick={this.saveState.bind(this)} className="btn btn-secondary grouped-form-control-button" type="button" style={{
							borderTopRightRadius: 0,
							borderBottomRightRadius: 0,
							borderRight: 0
						}}>Save</button>
					</span>
				</div>

				<div className="btn-group" role="group" aria-label="Button group with nested dropdown">


					<button type="button" className="btn btn-secondary" onClick={this.deleteHandler.bind(this)} style={{
						borderTopLeftRadius: 0,
						borderBottomLeftRadius: 0,
						marginLeft: -1
					}}>Delete</button>


					<div className="btn-group" role="group">
						<button id="btnGroupDrop1" type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Load
						</button>
						<div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
							{this.state.dropdown_items}
						</div>
					</div>

					<button type="button" className="btn btn-secondary" onClick={this.importHandler.bind(this)} style={{
						borderTopLeftRadius: 0,
						borderBottomLeftRadius: 0,
						marginLeft: -1
					}}>Import</button>

					<button type="button" className="btn btn-secondary" onClick={this.exportHandler.bind(this)} style={{
						borderTopLeftRadius: 0,
						borderBottomLeftRadius: 0,
						marginLeft: -1
					}}>Export...</button>
				</div>

				<Scope onSave={this.saveHandler.bind(this)} update_version={this.state.update_version} scope={this.state.scope} />

			</div>

		);
	}


}