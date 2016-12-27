/*
 * ### Editor interface for 50-state map
 */
import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import update from 'react-addons-update';

const NumericScaleSettings = require("../shared/NumericScaleSettings.jsx");
const Map_ScaleSettings = require("../shared/Cartogram_ScaleSettings.jsx");

const cx = require("classnames");
import {bind, clone, each, keys, map} from 'lodash';

/* Shared Chartbuilder components */
const DataInput = require("../shared/DataInput.jsx");

/* Chartbuilder UI components */
import {ColorPicker, Dropdown, LabelledTangle, TextInput, Toggle} from 'chartbuilder-ui';

const colorScales = require('./../../util/colorscales');
const MapEditorMixin = require("../mixins/MapEditorMixin.js");


/* this needs to be moved into the config file
*/

const map_strokes = [
  {
    title: "",
    content: "Darker Grey",
    value: "#333"
  },
  {
    title: "",
    content: "Dark Grey",
    value: "#666"
  },
  {
    title: "",
    content: "Grey",
    value: "#aaa"
  },
  {
    title: "",
    content: "Lightest Grey",
    value: "#eee"
  },
  {
    title: "",
    content: "White",
    value: "#fff"
  }
];

const map_type = [
  {
    title: "",
    content: "Grid",
    value: "grid"
  },
  {
    title: "",
    content: "Demers",
    value: "demers"
  },
  {
    title: "",
    content: "Dorling",
    value: "dorling"
  }
];


/**
 * ### Editor interface for a XY chart
 * @property {object} chartProps - Properties used to draw this chart
 * @property {number} numSteps - Allow the rendered component to interacted with and edited
 * @instance
 * @memberof editors
 */
let MapEditor = React.createClass({

  propTypes: {
    errors: PropTypes.object,
    chartProps: PropTypes.shape({
      input: PropTypes.object.isRequired,
      chartSettings: PropTypes.array,
      entries: PropTypes.array,
      data: PropTypes.array,
      scale: PropTypes.object,
      _annotations: PropTypes.object
    }),
    numSteps: PropTypes.number
  },

  mixins: [MapEditorMixin],

  getDefaultProps: function() {
    return {
      numSteps: 4
    };
  },
  render: function() {

    const mapProps = this.props.chartProps;
    const stylings = mapProps.stylings;

    let valuesOption = false;

    /* Create a settings component for each data series (column) */
    const mapSettings = [];

    mapSettings.push(map(mapProps.chartSettings, bind(function(chartSetting, i) {

      return (
        <div>
          <MapCartogram_mapSettings
            chartSettings={mapProps.chartSettings}
            onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
            onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
            numColors={this.props.numColors}
            stylings={this.props.chartProps.stylings}
            index={i}
            key={i}
          />

          <Map_ScaleSettings
            stylings={this.props.chartProps.stylings}
            scale={mapProps.scale}
            className="scale-options"
            onUpdate={this._handlePropAndReparse.bind(null, "scale")}
            onReset={this._handlePropAndReparse.bind(null, "scale")}
            id={chartSetting.label}
            name={chartSetting.label}
            stepNumber="0"
            index={i}
            key={i + '-scale'}
          />
        </div>
      );
    }, this)) );

    const cartogramOption = [];

    cartogramOption.push(<h3>Cartogram Type</h3>);
    cartogramOption.push(<ButtonGroup
        className="button-group-wrapper"
        buttons={map_type}
        key="cartogram_type"
        onClick={this._handleStylingsUpdate.bind(null, "type")}
        value={stylings.type}
      />);

    if (stylings.type === 'grid') {
      valuesOption = (<div className="toggle">
        <Toggle
          className="button-group-wrapper"
          key="show_values"
          label="Show Values"
          onToggle={this._handleStylingsUpdate.bind(null, "showValuesLabels")}
          toggled={stylings.showValuesLabels}
        /></div>);
    }

   const dcOption = (<div className="toggle"><Toggle
          className="button-group-wrapper"
          label="DC Y/N"
          onToggle={this._handleStylingsUpdate.bind(null, "showDC")}
          toggled={stylings.showDC}
          key="show_hide_dc"
        /></div>);

   const legendTextOption = (<div className="legend-text"><h3>Extra legend text</h3>
      <TextArea
        label="Extra legend text"
        onChange={this._handleStylingsUpdate.bind(null, "legendText")}
        value={stylings.legendText}
        isRequired={true}
        key="legend_text_extra"
      /></div>);

   const legendTicks = (<div className="toggle">
          <Toggle
            key={"legend_ticks_toggle_" + this.props.metadata.chartType}
            className="button-group-wrapper"
            label="Legend ticks"
            onToggle={this._handleStylingsUpdate.bind(null, "showLegendTicks")}
            toggled={stylings.showLegendTicks}
          /></div>);

    const shapeSize = (<div className="toggle">
              <LabelledTangle
                tangleClass="tangle-input"
                onChange={this._handleStylingsUpdate.bind(null, 'radiusVal')}
                onInput={this._handleStylingsUpdate.bind(null, 'radiusVal')}
                step={1}
                label="Max shape"
                min={1}
                max={60}
                key="radius_val"
                value={this.props.stylings.radiusVal}
              /></div>);

    const axisErrors = this.props.errors.messages.filter(function(e) {
      return e.location === "axis";
    });

    const inputErrors = this.props.errors.messages.filter(function(e) {
      return e.location === "input";
    });

    return (
      <div className="xy-editor">
        <div className="editor-options">
          <h2>
            <span className="step-number">2</span>
            <span>Input your data</span>
          </h2>
          <DataInput
            errors={inputErrors}
            chartProps={mapProps}
            className="data-input"
          />
        </div>
        <div className="editor-options">
          <h2>
            <span className="step-number">{this.props.stepNumber}</span>
            <span>Set series options</span>
          </h2>
          {mapSettings}
        </div>
        <div className="editor-options">
        </div>

	      <div className="editor-options">
	        <h2>
	          <span className="step-number">{this.props.stepNumber + 1}</span>
	          <span>Make additional stylings</span>
	        </h2>
	        	{cartogramOption}
	        <h3>
	          Color shape outlines
	        </h3>
	        <ButtonGroup
	          className="button-group-wrapper"
	          buttons={map_strokes}
	          onClick={this._handleStylingsUpdate.bind(null, "stroke")}
	          value={stylings.stroke}
	          key="choose_strokes"
	        />
	        <div className="stylings-toggle-inputs"
	          key="stylings_inputs">
	          {stateNames}
	          {legendTicks}
	          {valuesOption}
	          {shapeSize}
	          {dcOption}
	        </div>
	        {legendTextOption}
	      </div>
      </div>
    );
  }
});


/**
 * Series-specific settings for each column in data
 * @property {boolean} allowSecondaryAxis - Should a secondary axis be allowed
 * @property {object[]} chartSettings - Current settings for data series
 * @property {function} onUpdate - Callback that handles new series settings
 * @property {function} onUpdateReparse - Callback that handles new series settings,
 * but which need to be sent back to `parse-xy`
 * @property {number} numColors - Total number of possible colors
 * @instance
 * @memberof XYEditor
 */
const MapCartogram_mapSettings = React.createClass({

  propTypes: {
    chartSettings: PropTypes.array,
    numColors: PropTypes.number
  },

  _handleSettingsUpdate: function(ix, k, v) {

    /* Clone the array of objects so that we dont mutate existing state */
    let chartSettings = map(this.props.chartSettings, clone);
    /* We need the index (ix) of the settings object to know which to update */
    chartSettings[ix][k] = v;
    /* `axis` and `colorIndex` require reparsing the input and splitting it up */
    this.props.onUpdateReparse(chartSettings);
  },

  render: function() {

    const chartSetting = this.props.chartSettings[this.props.index];
    const numColors = colorScales.scalesNum();

    return (
      <div className="series-control">
        <TextInput
          type="text"
          label={chartSetting.label}
          value={chartSetting.label}
          onChange={this._handleSettingsUpdate.bind(null, this.props.index, "label")}
          className={"series-label-input series-label-input-" + chartSetting.colorIndex}
        />
        <h3 className={"series-label series-label-" + chartSetting.colorIndex}>
        </h3>

        <div className="section axis-color">
          <div className="section colorsection">
            <ColorPicker
              onChange={this._handleSettingsUpdate.bind(null, this.props.index, "colorIndex")}
              numColors={numColors}
              index={this.props.index}
              colorIndex={chartSetting.colorIndex}
              labelText="Color"
            />
          </div>
        </div>

        <div className="clearfix"></div>
      </div>
    );
  }
});

module.exports = MapEditor;