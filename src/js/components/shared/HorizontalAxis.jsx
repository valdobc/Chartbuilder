// Svg text elements used to describe chart
var React = require("react");
var PropTypes = React.PropTypes;
var map = require("lodash/map");

var DY = "0.32em"

var HorizontalAxis = React.createClass({

	propTypes: {
		scaleOptions: PropTypes.object,
		orient: PropTypes.string,
		dimensions: PropTypes.object,
		xScale: PropTypes.object
	},

	getDefaultProps: function() {
		return {
			orient: "bottom"
		}
	},

	_generateTicks: function(props) {
		var xScale = props.xScale;

		return map(xScale.ticks, function(tickValue, i) {
			var text = xScale.tickFormat(tickValue);

			return (
				<text
					key={i}
					className={"tick orient-" + props.orient}
					transform={"translate(" + [props.xScale.scaleFunc(tickValue), 0] + ")"}
					dy={DY}
				>
					{text}
				</text>
			)
		});

	},

	_getTransform: function(orient, height) {
		if (orient == "top") {
			return 0;
		} else if (orient == "bottom") {
			return height;
		}
	},

	render: function() {
		var props = this.props;
		var ticks = this._generateTicks(props);
		var transformY = this._getTransform(props.orient, props.dimensions.height);

		return (
			<g
				className="axis horizontal-axis"
				transform={"translate(" + [0, transformY + 20] + ")"}
			>
				{ticks}
			</g>
		);
	}

});

module.exports = HorizontalAxis;
