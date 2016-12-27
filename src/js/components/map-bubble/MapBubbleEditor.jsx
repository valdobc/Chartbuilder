/*
 * ### Editor interface for 50-state map
 */
import React, {PropTypes} from 'react';
import update from 'react-addons-update';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {clone, each, keys, map, bind} from 'lodash';

/* Chartbuilder UI components */
import {ColorPicker, LabelledTangle, TextInput, Toggle} from 'chartbuilder-ui';

//const NumericScaleSettings = require("../shared/NumericScaleSettings.jsx");
const Map_ScaleSettings = require("../shared/Cartogram_ScaleSettings.jsx");

const cx = require("classnames");
const DataInput = require("../shared/DataInput.jsx");
const colorScales = require('./../../util/colorscales');
const MapEditorMixin = require("../mixins/MapEditorMixin.js");


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

/**
 * ### Editor interface for a XY chart
 * @property {object} chartProps - Properties used to draw this chart
 * @property {number} numSteps - Allow the rendered component to interacted with and edited
 * @instance
 * @memberof editors
 */
const MapEditor = React.createClass({

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
    /* Create a settings component for each data series (column) */
    const mapSettings = [];

    /*
          <MapCartogram_mapSettings
            chartSettings={mapProps.chartSettings}
            onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
            onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
            numColors={this.props.numColors}
            stylings={mapProps.stylings}
            index={i}
            key={i}
          />*/

    mapSettings.push( map(mapProps.chartSettings, bind(function(chartSetting, i) {
      return (
        <div>
          <Map_ScaleSettings
            stylings={mapProps.stylings}
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
        	<MapCartogram_mapSettings
            chartSettings={mapProps.chartSettings}
            onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
            onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
            numColors={this.props.numColors}
            stylings={mapProps.stylings}
            index={i}
            key={i}
          />
        </div>
      );
    }, this)) );

    console.log(mapSettings,'eek');

    //let chartProps = this.props.chartProps;
    //let scaleSettings = [];

    const axisErrors = this.props.errors.messages.filter(function(e) {
      return e.location === "axis";
    });

    const inputErrors = this.props.errors.messages.filter(function(e) {
      return e.location === "input";
    });

    const legendTextOption = (<div className="legend-text"><h3>Extra legend text</h3>
      <TextArea
        key="legend_text_extra"
        onChange={this._handleStylingsUpdate.bind(null, "legendText")}
        value={stylings.legendText}
        isRequired={true}
      /></div>)

    const shapeSize = (<div className="toggle">
      <LabelledTangle
        tangleClass="tangle-input"
        onChange={this._handleStylingsUpdate.bind(null, 'radiusVal')}
        onInput={this._handleStylingsUpdate.bind(null, 'radiusVal')}
        step={1}
        label="Max shape"
        key="max_shape"
        min={1}
        max={60}
        value={this.props.stylings.radiusVal}
      /></div>);

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
	          {shapeSize}
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
    const chartSettings = map(this.props.chartSettings, clone);
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