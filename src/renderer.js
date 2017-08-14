const {ipcRenderer} = require('electron');

import React from 'react';
import ReactDOM from 'react-dom';

// let Main = require('../scripts/autoclicker.jsx');


window.addEventListener('beforeunload', (event) => {
	ipcRenderer.send('main-channel', 'reset');
});

class ListItem extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			title: '',
			ta_print: ''
		};

		this.noCollapse = this.noCollapse.bind(this);
		this.taPrint = this.taPrint.bind(this);

		this.console_line_break = '\n> ';
	}

	markLine(ev) {
		let el = ev.target;
		let colors = ['d9534f', 'ec971f', '5bc0de', '449d44', 'e6e6e6', '025aa5'];

		if (typeof $(el).data('color-index') === 'undefined') {
			$(el).data('color-index', 0);
		} else {
			$(el).data('color-index', $(el).data('color-index') + 1);
		}

		$(el).css({
			'background-color': '#' + colors[$(el).data('color-index') % colors.length]
		});
	}

	getRows() {

	// return <textarea value={this.state.ta_print} onChange={(ev) => {return false;}} />;
		let rows = this.state.ta_print.split(this.console_line_break)
		let _max_rows = 6;

		// remove blank lines
		rows = rows.filter((value) => {
			return value.replace(/\s/gi) !== '';
		});

		// remove the overlap
		if (rows.length > _max_rows) {
			rows = rows.slice(rows.length - _max_rows, rows.length);
			rows = ['...'].concat(rows);
		}


		return rows.map((line, index) => {
			return (
				<div className="input-group console-line" key={index}>
					<span className="input-group-addon" id={`line-prefix-${index}`} onMouseDown={this.markLine}>></span>
					<input value={line} onFocus={(ev) => {ev.target.select()}} onChange={(ev) => {return false;}} type="text" className="form-control" aria-describedby={`line-prefix-${index}`} />
				</div>
			);
		})
	}

	render() {
		let Controls = this.props.Controls;

		return (
			<div>
				<a onDragStart={(ev) => {ev.preventDefault();}} href={`#collapse-${this.props.id}`} className="list-group-item collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls={`collapse-${this.props.id}`}>
					<h4 className="list-group-item-heading" role='tab' id={`heading-${this.props.id}`}>
						{this.state.title}
					</h4>
				</a>
				<div className="list-group-item-text collapse" id={`collapse-${this.props.id}`} role="tabpanel" aria-labelledby={`heading-${this.props.id}`} aria-expanded='false'>

					<div className='no-collapse'>
						<Controls log={this.taPrint} ref={(c) => { this._controls = c; } } />

						<div className='console'>
							{this.getRows()}
						</div>

					</div>
				</div>
			</div>
		);
	}

	taPrint(message) {
		var formated = this.state.ta_print,
			line_break = this.console_line_break;


		while (message.slice(0,2) === '<<') {
			if (message.slice(0,2) === '<<') {
				formated = formated.slice(0, formated.length - 1);
				message = message.slice(2);
			}
		}

		if (message.slice(0,1) === '<') {
			line_break = '';
			message = message.slice(1);
		}

		formated = formated + line_break + message;

		this.setState({
			ta_print: formated
		});
	}

	noCollapse(ev) {

		// ev.preventDefault();
		// ev.stopPropagation();
		ev.stopImmediatePropagation();

		let target = $(ev.target);

		if (['button'].indexOf(target.prop('tagName').toLowerCase()) > -1 && !target.data('clicked')) {
			target.data('clicked', true);

			$(ev.target).trigger('click');
		}
		if (target.data('clicked')) {
			target.data('clicked', false);
		}

	}

	componentDidMount() {
		this.setState({title: this._controls.title});

		// $(ReactDOM.findDOMNode(this)).find('.no-collapse').on('click', this.noCollapse);

	}
}

class List extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'List';
	}
	render() {
		let items = this.props.scripts.map((fpath, index) => {
			let { Controls } = require(fpath);
			return <ListItem Controls={Controls} key={index} id={index} />;
		});

		return (
			<div id="accordion" role="tablist" aria-multiselectable="true">
				<div className="list-group">
					{items}
				</div>
			</div>
		);
	}
}

class Main extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'Main';
	}
	render() {
		return (
			<div>
				<h1>RS automator</h1>
				<List scripts={this.props.scripts} />
			</div>	
		)
	}
}



ipcRenderer.on('render-controls', (event, scripts) => {


	ReactDOM.render(<Main scripts={scripts} />, document.getElementById('main'));

	// scripts.forEach((fpath) => {
	// 	let { Controls } = require(fpath);
	// 	console.log(Controls);
	// });

	// console.log(scripts);

});



window.onload = function () {


	ipcRenderer.send('render-controls', 'start importing scripts');
}
