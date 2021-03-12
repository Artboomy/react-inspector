import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useStyles } from '../styles';
import HighlightContext from '../tree-view/HighlightContext';
import reactStringReplace from 'react-string-replace';

/**
 * A view for object property names.
 *
 * If the property name is enumerable (in Object.keys(object)),
 * the property name will be rendered normally.
 *
 * If the property name is not enumerable (`Object.prototype.propertyIsEnumerable()`),
 * the property name will be dimmed to show the difference.
 */
const ObjectName = ({ name, dimmed = false, styles = {} }) => {
  const themeStyles = useStyles('ObjectName');
  const appliedStyles = {
    ...themeStyles.base,
    ...(dimmed ? themeStyles['dimmed'] : {}),
    ...styles,
  };
  const highlight = useContext(HighlightContext);

  return (
    <span style={appliedStyles}>
      {highlight
        ? reactStringReplace(name, highlight, (v) => <mark>{v}</mark>)
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
