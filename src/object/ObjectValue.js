import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useStyles } from '../styles';
import HighlightContext from '../tree-view/HighlightContext';
import reactStringReplace from 'react-string-replace';

/**
 * A short description of the object values.
 * Can be used to render tree node in ObjectInspector
 * or render objects in TableInspector.
 */
const ObjectValue = ({ object, styles }) => {
  const themeStyles = useStyles('ObjectValue');

  const highlight = useContext(HighlightContext);
  const fullMatchHighlight = (value) => {
    return highlight && value === highlight ? <mark>{value}</mark> : value;
  };
  const partialHighlight = (value) => {
    return highlight
      ? reactStringReplace(value, highlight, (v) => <mark>{v}</mark>)
      : value;
  };
  const mkStyle = (key) => ({ ...themeStyles[key], ...styles });

  switch (typeof object) {
    case 'bigint':
      return (
        <span style={mkStyle('objectValueNumber')}>
          {partialHighlight(String(object))}n
        </span>
      );
    case 'number':
      return (
        <span style={mkStyle('objectValueNumber')}>
          {partialHighlight(String(object))}
        </span>
      );
    case 'string':
      return (
        <span style={mkStyle('objectValueString')}>
          "{partialHighlight(object)}"
        </span>
      );
    case 'boolean':
      return (
        <span style={mkStyle('objectValueBoolean')}>
          {fullMatchHighlight(String(object))}
        </span>
      );
    case 'undefined':
      return (
        <span style={mkStyle('objectValueUndefined')}>
          {fullMatchHighlight('undefined')}
        </span>
      );
    case 'object':
      if (object === null) {
        return (
          <span style={mkStyle('objectValueNull')}>
            {fullMatchHighlight('null')}
          </span>
        );
      }
      if (object instanceof Date) {
        return <span>{partialHighlight(object.toString())}</span>;
      }
      if (object instanceof RegExp) {
        return (
          <span style={mkStyle('objectValueRegExp')}>{object.toString()}</span>
        );
      }
      if (Array.isArray(object)) {
        return <span>{`Array(${object.length})`}</span>;
      }
      if (!object.constructor) {
        return <span>Object</span>;
      }
      if (
        typeof object.constructor.isBuffer === 'function' &&
        object.constructor.isBuffer(object)
      ) {
        return <span>{`Buffer[${object.length}]`}</span>;
      }

      return <span>{object.constructor.name}</span>;
    case 'function':
      return (
        <span>
          <span style={mkStyle('objectValueFunctionPrefix')}>ƒ&nbsp;</span>
          <span style={mkStyle('objectValueFunctionName')}>
            {object.name}()
          </span>
        </span>
      );
    case 'symbol':
      return (
        <span style={mkStyle('objectValueSymbol')}>{object.toString()}</span>
      );
    default:
      return <span />;
  }
};

ObjectValue.propTypes = {
  // the object to describe
  object: PropTypes.any,
  highlight: PropTypes.func,
};

export default ObjectValue;
