import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useStyles } from '../styles';
import { useHighlight } from '../utils/HighlightContext';
import { partialHighlight } from '../utils/stringManipulations';
import SearchContext from '../utils/SearchContext';

/**
 * A view for object property names.
 *
 * If the property name is enumerable (in Object.keys(object)),
 * the property name will be rendered normally.
 *
 * If the property name is not enumerable (`Object.prototype.propertyIsEnumerable()`),
 * the property name will be dimmed to show the difference.
 */
const ObjectName = ({
  name,
  dimmed = false,
  styles = {},
  isPreview = false,
}) => {
  const themeStyles = useStyles('ObjectName');
  const appliedStyles = {
    ...themeStyles.base,
    ...(dimmed ? themeStyles['dimmed'] : {}),
    ...(isPreview ? themeStyles['preview'] : {}),
    ...styles,
  };
  const highlight = useHighlight(dimmed);
  const { caseSensitive } = useContext(SearchContext);
  return (
    <span style={appliedStyles}>
      {highlight
        ? partialHighlight(name, highlight, {
            style: themeStyles['highlight'],
            caseSensitive,
          })
        : name}
    </span>
  );
};

ObjectName.propTypes = {
  /** Property name */
  name: PropTypes.string,
  /** Should property name be dimmed */
  dimmed: PropTypes.bool,
};

export default ObjectName;
