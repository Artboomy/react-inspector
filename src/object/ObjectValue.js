import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useStyles } from '../styles';
import { useHighlight } from '../utils/HighlightContext';
import {
  fullMatchHighlight,
  partialHighlight,
} from '../utils/stringManipulations';
import SearchContext from '../utils/SearchContext';

const stringRender = (
  value,
  partialHighlight,
  spanStyle,
  isPreview,
  highlight,
  style
) => {
  let result = value;
  if (typeof value === 'string') {
    const lengthLimit = 500;
    const lengthPreviewLimit = 50;
    const isLongValue = value.length > (isPreview ? lengthPreviewLimit : lengthLimit);
    const modifiedSpanStyle = {
      ...spanStyle,
      ...(isPreview && { whiteSpace: 'normal' }),
    };
    if (isLongValue) {
      if (isPreview) {
        result = (
          <span style={modifiedSpanStyle}>
            "{partialHighlight(`${value.slice(0, 30)}…${value.slice(value.length - 11)}`, highlight, style)}"
          </span>
        );
      } else {
        result = (
          <details style={{ display: 'inline-block', ...spanStyle }}>
            <summary style={{ outline: 'none', cursor: 'pointer' }}>
              <i>String of {value.length} characters</i>
            </summary>
            <span>{partialHighlight(value, highlight, style)}</span>
          </details>
        );
      }
    } else {
      result = (
        <span style={modifiedSpanStyle}>
          "{partialHighlight(value, highlight, style)}"
        </span>
      );
    }
  }
  return result;
};

/**
 * A short description of the object values.
 * Can be used to render tree node in ObjectInspector
 * or render objects in TableInspector.
 */
const ObjectValue = ({
  object,
  styles,
  isPreview = false,
  isDimmed = false,
}) => {
  const themeStyles = useStyles('ObjectValue');
  const highlight = useHighlight(isDimmed);
  const { caseSensitive } = useContext(SearchContext);
  const mkStyle = (key) => ({
    ...themeStyles[key],
    ...styles,
    ...(isDimmed && themeStyles['objectValueDimmed']),
  });

  switch (typeof object) {
    case 'bigint':
      return (
        <span style={mkStyle('objectValueNumber')}>
          {partialHighlight(String(object), highlight, {
            style: themeStyles['highlight'],
            caseSensitive,
          })}
          n
        </span>
      );
    case 'number':
      return (
        <span style={mkStyle('objectValueNumber')}>
          {partialHighlight(String(object), highlight, {
            style: themeStyles['highlight'],
            caseSensitive,
          })}
        </span>
      );
    case 'string':
      return stringRender(
        object,
        partialHighlight,
        mkStyle('objectValueString'),
        isPreview,
        highlight,
        { style: themeStyles['highlight'], caseSensitive }
      );
    case 'boolean':
      return (
        <span style={mkStyle('objectValueBoolean')}>
          {fullMatchHighlight(String(object), highlight, {
            style: themeStyles['highlight'],
            caseSensitive,
          })}
        </span>
      );
    case 'undefined':
      return (
        <span style={mkStyle('objectValueUndefined')}>
          {fullMatchHighlight('undefined', highlight, {
            style: themeStyles['highlight'],
            caseSensitive,
          })}
        </span>
      );
    case 'object':
      if (object === null) {
        return (
          <span style={mkStyle('objectValueNull')}>
            {fullMatchHighlight('null', highlight, {
              style: themeStyles['highlight'],
              caseSensitive,
            })}
          </span>
        );
      }
      if (object instanceof Date) {
        return (
          <span style={isDimmed ? themeStyles['objectValueDimmed'] : {}}>
            {partialHighlight(object.toString(), highlight, {
              style: themeStyles['highlight'],
              caseSensitive,
            })}
          </span>
        );
      }
      if (object instanceof RegExp) {
        return (
          <span style={mkStyle('objectValueRegExp')}>{object.toString()}</span>
        );
      }
      if (Array.isArray(object)) {
        return (
          <span
            style={
              isDimmed ? themeStyles['objectValueDimmed'] : {}
            }>{`Array(${object.length})`}</span>
        );
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
        return (
          <span style={isDimmed ? themeStyles['objectValueDimmed'] : {}}>
            {Object.keys(object).length ? '{…}' : '{}'}
          </span>
        );
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
