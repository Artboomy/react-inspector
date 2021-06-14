import reactStringReplace from 'react-string-replace';
import React from 'react';

export const fullMatchHighlight = (value, highlight, options) => {
  const { style, caseSensitive } = options;
  const valueToCompare = caseSensitive ? value : String(value).toLowerCase();
  return highlight && valueToCompare === highlight ? (
    <mark style={style}>{value}</mark>
  ) : (
    value
  );
};

export const partialHighlight = (value, highlight, options) => {
  const { style, caseSensitive = false } = options;
  return highlight
    ? reactStringReplace(value, highlight, (v, idx) => {
        const isEqual = caseSensitive ? highlight === v : true;
        return isEqual ? (
          <mark key={idx} style={style}>
            {v}
          </mark>
        ) : (
          v
        );
      })
    : value;
};
