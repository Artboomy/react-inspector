import React from 'react';

import ObjectValue from '../object/ObjectValue';
import ObjectName from '../object/ObjectName';

import { useStyles } from '../styles';

import { hasOwnProperty } from '../utils/objectPrototype';
import { getPropertyValue } from '../utils/propertyUtils';

/* intersperse arr with separator */
function intersperse(arr, sep) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
}

/**
 * A preview of the object
 */
const ObjectPreview = ({ data, symbol }) => {
  const styles = useStyles('ObjectPreview');
  const object = data;

  if (
    typeof object !== 'object' ||
    object === null ||
    object instanceof Date ||
    object instanceof RegExp
  ) {
    return <ObjectValue object={object} isPreview />;
  }

  if (Array.isArray(object)) {
    const maxProperties = styles.arrayMaxProperties;
    const previewArray = object
      .slice(0, maxProperties)
      .map((element, index) => (
        <ObjectValue key={index} object={element} isPreview />
      ));
    if (object.length > maxProperties) {
      previewArray.push(<span key="ellipsis">…</span>);
    }
    const arrayLength = object.length;
    return (
      <React.Fragment>
        <span style={styles.objectDescription}>
          {arrayLength === 0 ? `` : `(${arrayLength})\xa0`}
        </span>
        <span style={styles.preview}>[{intersperse(previewArray, ', ')}]</span>
      </React.Fragment>
    );
  } else {
    const maxProperties = styles.objectMaxProperties;
    let propertyNodes = [];
    const propertyVisible = (propertyName) =>
      symbol ? object[symbol].includes(propertyName) : true;
    for (const propertyName in object) {
      if (
        hasOwnProperty.call(object, propertyName) &&
        propertyVisible(propertyName)
      ) {
        let ellipsis;
        if (
          propertyNodes.length === maxProperties - 1 &&
          Object.keys(object).length > maxProperties
        ) {
          ellipsis = <span key={'ellipsis'}>…</span>;
        }

        const propertyValue = getPropertyValue(object, propertyName);
        propertyNodes.push(
          <span key={propertyName}>
            <ObjectName name={propertyName || `""`} isPreview />
            :&nbsp;
            <ObjectValue object={propertyValue} isPreview />
            {ellipsis}
          </span>
        );
        if (ellipsis) break;
      }
    }
    if (!propertyNodes.length && Object.keys(object).length && symbol) {
      return <i>Filtered</i>;
    }

    const objectConstructorName = object.constructor
      ? object.constructor.name
      : 'Object';

    return (
      <React.Fragment>
        <span style={styles.objectDescription}>
          {objectConstructorName === 'Object'
            ? ''
            : `${objectConstructorName} `}
        </span>
        <span style={styles.preview}>
          {'{'}
          {intersperse(propertyNodes, ', ')}
          {'}'}
        </span>
      </React.Fragment>
    );
  }
};

ObjectPreview.displayName = 'ObjectPreview';

export default ObjectPreview;
