import React from 'react';
import PropTypes from 'prop-types';
import TreeView from '../tree-view/TreeView';
import ObjectRootLabel from './ObjectRootLabel';
import ObjectLabel from './ObjectLabel';

import { propertyIsEnumerable } from '../utils/objectPrototype';
import { getPropertyValue } from '../utils/propertyUtils';

import { themeAcceptor } from '../styles';
import { markMatches, useSearchParams } from '../utils/SearchContext';

const createIterator = (
  showNonenumerable,
  sortObjectKeys,
  symbol,
  hideUnrelated
) => {
  const objectIterator = function* (data) {
    const shouldIterate =
      (typeof data === 'object' && data !== null) || typeof data === 'function';
    if (!shouldIterate) return;

    const dataIsArray = Array.isArray(data);

    // iterable objects (except arrays)
    if (!dataIsArray && data[Symbol.iterator]) {
      let i = 0;
      for (let entry of data) {
        if (Array.isArray(entry) && entry.length === 2) {
          const [k, v] = entry;
          yield {
            name: k,
            data: v,
          };
        } else {
          yield {
            name: i.toString(),
            data: entry,
          };
        }
        i++;
      }
    } else {
      const keys = Object.getOwnPropertyNames(data);
      if (sortObjectKeys === true && !dataIsArray) {
        // Array keys should not be sorted in alphabetical order
        keys.sort();
      } else if (typeof sortObjectKeys === 'function') {
        keys.sort(sortObjectKeys);
      }

      for (const propertyName of keys) {
        if (propertyIsEnumerable.call(data, propertyName)) {
          // The idea was to hide unrelated paths
          // sadly when there is match in params, request can be hidden and its not useful
          // turned off for now
          // const hasAnyFields = !symbol || data[symbol].length;
          if (
            !symbol ||
            data[symbol].includes(
              dataIsArray ? Number(propertyName) : propertyName
            )
          ) {
            const propertyValue = getPropertyValue(data, propertyName);
            yield {
              name: propertyName || `""`,
              data: propertyValue,
            };
          } else if (!hideUnrelated) {
            const propertyValue = getPropertyValue(data, propertyName);
            yield {
              name: propertyName || `""`,
              data: propertyValue,
              isDimmed: true,
            };
          }
        } else if (showNonenumerable) {
          // To work around the error (happens some time when propertyName === 'caller' || propertyName === 'arguments')
          // 'caller' and 'arguments' are restricted function properties and cannot be accessed in this context
          // http://stackoverflow.com/questions/31921189/caller-and-arguments-are-restricted-function-properties-and-cannot-be-access
          let propertyValue;
          try {
            propertyValue = getPropertyValue(data, propertyName);
          } catch (e) {
            // console.warn(e)
          }

          if (propertyValue !== undefined) {
            yield {
              name: propertyName,
              data: propertyValue,
              isNonenumerable: true,
            };
          }
        }
      }

      // [[Prototype]] of the object: `Object.getPrototypeOf(data)`
      // the property name is shown as "__proto__"
      if (showNonenumerable && data !== Object.prototype /* already added */) {
        yield {
          name: '__proto__',
          data: Object.getPrototypeOf(data),
          isNonenumerable: true,
        };
      }
    }
  };

  return objectIterator;
};

const defaultNodeRenderer = ({
  depth,
  name,
  data,
  isNonenumerable,
  isDimmed,
}) =>
  depth === 0 ? (
    <ObjectRootLabel name={name} data={data} isDimmed={isDimmed} />
  ) : (
    <ObjectLabel
      name={name}
      data={data}
      isNonenumerable={isNonenumerable}
      isDimmed={isDimmed}
    />
  );

/**
 * Tree-view for objects
 */
const ObjectInspector = ({
  showNonenumerable = false,
  sortObjectKeys,
  nodeRenderer,
  data,
  ...treeViewProps
}) => {
  const { symbol, marker, hideUnrelated } = useSearchParams();
  const dataIterator = createIterator(
    showNonenumerable,
    sortObjectKeys,
    symbol,
    hideUnrelated
  );
  const renderer = nodeRenderer ? nodeRenderer : defaultNodeRenderer;
  if (symbol) {
    markMatches({ data }, 'data', marker, symbol);
  }
  return (
    <TreeView
      nodeRenderer={renderer}
      dataIterator={dataIterator}
      data={data}
      {...treeViewProps}
    />
  );
};

ObjectInspector.propTypes = {
  /** An integer specifying to which level the tree should be initially expanded. */
  expandLevel: PropTypes.number,
  /** An array containing all the paths that should be expanded when the component is initialized, or a string of just one path */
  expandPaths: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),

  name: PropTypes.string,
  /** Not required prop because we also allow undefined value */
  data: PropTypes.any,

  /** Show non-enumerable properties */
  showNonenumerable: PropTypes.bool,
  /** Sort object keys with optional compare function. */
  sortObjectKeys: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

  /** Provide a custom nodeRenderer */
  nodeRenderer: PropTypes.func,
};

export default themeAcceptor(ObjectInspector);
