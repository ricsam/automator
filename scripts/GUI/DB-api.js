import * as _ from 'underscore'

function getParams(str) {

	if (! str.match("\\?") ) return {};

	let queryString = str;
	let keyValPairs = [];
	let params      = {};
	queryString     = queryString.replace(/.*?\?/,"");

	if (queryString.length) {
		keyValPairs = queryString.split('&');
		for (let pairNum in keyValPairs) {
			let key = keyValPairs[pairNum].split('=')[0];

			if (!key.length) continue;

			if ( ! _.has(params, key) ) {
				params[key] = keyValPairs[pairNum].split('=')[1];
			} else {
				params[key] = [params[key]];
				params[key].push(keyValPairs[pairNum].split('=')[1]);
			}
		}
	}
	return params;
}


export function getDB(id = null) {

	// GUI:e14bda43-c381-4102-8eee-9f0a11bcd901.sometype?lol=123&something=wef&whateva=123
	var db = {};
	
	let filterFunction = (key) => {


		let id = key.match(/\w+(\-\w+){4}(?=\.\w+)/g)[0];

		if (!id) {
			return console.log(key);
		}

		if (! _.has(db, id)) {
			db[id] = {};
		}

		var type = key.match(/\.\w+/g)[0].slice(1)

		let value = window.localStorage.getItem(key);

		try {
			value = JSON.parse(value);
		} catch (e) {
			e instanceof SyntaxError
		}

		let data = {
			params: getParams(key) || {},
			location: key,
			value: value,
		};

		if (_.has(db[id], type)) {

			if ( ! Array.isArray(db[id][type]) ) {
				db[id][type] = [db[id][type]];
			}

			db[id][type].push(data);

		} else {

			db[id][type] = data;
		}


	}


	if (id) {
		Object.keys(window.localStorage).filter((key) => {
			return key.match(new RegExp("^GUI\\:" + id))
		}).forEach(filterFunction);

		return db[id];
	}



	Object.keys(window.localStorage).filter((key) => {
		return key.match(/^GUI\:/)
	}).forEach(filterFunction);

	return db;

}


export function getEntryIdByName (name) {
	for (let i in window.localStorage) {
		let val = window.localStorage.getItem(i);
		if (val && val === name && i.match(/^GUI\:/)) {
			return i.match(/\w+(\-\w+){4}(?=\.\w+)/g)[0]
		}
	}

	return null;
}

export function deleteEntry (id) {
	for (let i in window.localStorage) {

		let _id = i.match(/^GUI\:(\w+(\-\w+){4})(?=\.\w+)/)[1];

		if (_id === id) {
			window.localStorage.removeItem(i);
		}
	}
}


export function actionMapper(cb, scope) {

	if ( ! _.has(scope, 'action') ) {
		return null;
	}

	let actions = scope.action;

	if ( ! Array.isArray(actions) ) {
		actions = [actions];
	}

	actions = _.clone(actions).sort((a, b) => {
		return Number(a.params.index) - Number(b.params.index);
	});

	return actions.map(cb);

}