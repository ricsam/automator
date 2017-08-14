
var extent = require('turf-extent');
var inside = require('turf-inside');
var random = require('turf-random');



export default function getPoint(points, x = null, y = null) {

	let polygon = {
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[]]
		}
	}
	points.forEach((point) => {
		polygon.geometry.coordinates[0].push([point.x, point.y]);
	});



	var bbox = extent(polygon);

	let point;

	if (x !== null && y !== null) {
		point = {
			"type":"FeatureCollection",
			"features":[{
				"type":"Feature",
				"geometry":{
					"type":"Point",
					"coordinates": [x,y]
				},"properties":{}
			}]
		};
	} else {
		point = random('point', 1, { bbox: bbox });
	}



	while (inside(point.features[0], polygon) !== true) {
		point = random('point', 1, { bbox: bbox });
	}

	var r_point = point.features[0].geometry.coordinates;

	return {
		x: r_point[0],
		y: r_point[1]
	};
}