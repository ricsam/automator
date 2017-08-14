import React from 'react';
import ReactDOM from 'react-dom';
export default class ActionWrapper extends React.Component {
	constructor(props) {
		super(props);
		['buttonHover', 'buttonReset'].forEach((n) => {
			this[n] = this[n].bind(this);
		});
	}
	render() {
		return (
			<div className='action'>
				<div className='control'>
					<button type="button" class="close" aria-label="Close" onMouseOver={this.buttonHover} onMouseOut={this.buttonReset} onClick={this.props.removeAction}>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div className='content'>
					{this.props.action}
				</div>
			</div>
		);
	}

	buttonHover(ev) {
		$(ReactDOM.findDOMNode(this)).find('.content h4').css({
			'text-decoration': 'line-through'
		});
	}
	buttonReset(ev) {
		$(ReactDOM.findDOMNode(this)).find('.content h4').css({
			'text-decoration': 'none'
		});
	}
}