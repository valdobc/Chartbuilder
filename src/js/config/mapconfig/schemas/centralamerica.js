const countries = require('./helpers/world');

const CA = {
	label: 'Central America',
	name: 'centralamerica',
	values: countries,
	proj: 'mercator',
	translate: [1050, 300],
	translateCartogram: [1050, 300],
	precision: 1,
	scale: 470,
	topojson : require('./../mapfiles/world/world.topo.json'),
	feature: 'lsib_world',
	adjustLabels: function(adjusty=0,adjustx=0, label) {
	  return [adjusty,adjustx,label];
	},
	matchLogic: function(val) {

		if (this.values[val]) { return this.values[val]; }
		else if (!isNaN(val)) { return +val; }
		else { return val; }
	},
	test: function(column_val, polygon_val) {
	  return (this.matchLogic(column_val) == polygon_val.id);
	}
 }

module.exports = CA;