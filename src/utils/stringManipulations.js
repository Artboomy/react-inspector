import reactStringReplace from 'react-string-replace';
import React from 'react';

export const fullMatchHighlight = (value, highlight, options) => {
  const { style } = options;
  return highlight && value === highlight ? (
    <mark style={style}>{value}</mark>
  ) : (
    value
  );
};

export const partialHighlight = (value, highlight, options) => {
  const { style, caseInsensitive = false } = options;
  return highlight
    ? reactStringReplace(value, highlight, (v, idx) => {
        const isEqual = caseInsensitive ? true : highlight === v;
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
