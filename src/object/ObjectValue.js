import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useStyles } from '../styles';
import HighlightContext from '../utils/HighlightContext';
import reactStringReplace from 'react-string-replace';

const stringRender = (value, partialHighlight, spanStyle, isPreview) => {
  let result = value;
  if (typeof value === 'string') {
    const lengthLimit = 500;
    const isLongValue = value.length > lengthLimit;
    if (isLongValue) {
      if (isPreview) {
        result = (
          <span style={spanStyle}>
            "{partialHighlight(value.slice(0, 50))}"
          </span>
        );
      } else {
        result = (
          <details style={{ display: 'inline-block' }}>
            <summary style={{ outline: 'none', cursor: 'pointer' }}>
              <i>String of {value.length} characters</i>
            </summary>
            <span style={spanStyle}>{value}</span>
          </details>
        );
      }
    } else {
      result = <span style={spanStyle}>"{partialHighlight(value)}"</span>;
    }
  }
  return result;
};
/**
 * A short description of the object values.
 * Can be used to render tree node in ObjectInspector
 * or render objects in TableInspector.
 */
const ObjectValue = ({ object, styles, isPreview = false }) => {
  const themeStyles = useStyles('ObjectValue');

  const highlight = useContext(HighlightContext);
  const fullMatchHighlight = (value) => {
    return highlight && value === highlight ? <mark>{value}</mark> : value;
  };
  const partialHighlight = (value) => {
    return highlight
      ? reactStringReplace(value, highlight, (v, idx) => (
          <mark key={idx}>{v}</mark>
        ))
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
      return stringRender(
        object,
        partialHighlight,
        mkStyle('objectValueString'),
        isPreview
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
      if (object.constructor.name === 'Object') {
        return <span>{Object.keys(object).length ? '{…}' : '{}'}</span>;
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
  isPreview: PropTypes.bool,
};

export default ObjectValue;
