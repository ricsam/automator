
import React from 'react';

export default class lqButtons extends React.Component {
	constructor(props) {
		super(props);

		['launch', 'quit'].forEach((l) => {
			this[l] = this[l].bind(this);
		});

		this.state = {
			application_running: false
		};

	}
	launch() {
		this.setState({application_running: true});
	}
	quit() {
		this.setState({application_running: false});
	}
	log(message) {
		this.props.log(message);
	}
	render(Elements = null) {
		return (
			<div>
				<div className="btn-group" role="group" aria-label="Button group with nested dropdown">
					<button type="button" className="btn btn-success" onClick={this.launch} disabled={this.state.application_running}>Launch</button>
					<button type="button" className="btn btn-danger" onClick={this.quit} disabled={!this.state.application_running}>Quit</button>
				</div>
				{(() => { if (Elements) return Elements; })()}
			</div>
		);
	}

}