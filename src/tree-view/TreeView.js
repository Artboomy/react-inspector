import React, {
  useContext,
  useCallback,
  useLayoutEffect,
  useState,
  memo,
} from 'react';
import PropTypes from 'prop-types';
import ExpandedPathsContext from './ExpandedPathsContext';
import TreeNode from './TreeNode';
import {
  DEFAULT_ROOT_PATH,
  hasChildNodes,
  getExpandedPaths,
} from './pathUtils';

import { useStyles } from '../styles';

const ConnectedTreeNode = memo(function ConnectedTreeNodeMemo(props) {
  const { data, dataIterator, path, depth, nodeRenderer, onMouseDown } = props;
  const [expandedPaths, setExpandedPaths] = useContext(ExpandedPathsContext);
  const nodeHasChildNodes = hasChildNodes(data, dataIterator);
  const expanded = !!expandedPaths[path];

  const getDescendantExpandablePaths = useCallback(
    (nodeData, basePath) => {
      const acc = [];
      for (const { name, data: childData } of dataIterator(nodeData)) {
        const childPath = `${basePath}.${name}`;
        if (hasChildNodes(childData, dataIterator)) {
          acc.push(childPath);
          // recurse only into expandable nodes
          acc.push(...getDescendantExpandablePaths(childData, childPath));
        }
      }
      return acc;
    },
    [dataIterator]
  );

  const handleClick = useCallback(
    (event) => {
      if (!nodeHasChildNodes) return;
      const recursive = !!(event && (event.metaKey || event.ctrlKey));
      if (!recursive) {
        setExpandedPaths((prevExpandedPaths) => ({
          ...prevExpandedPaths,
          [path]: !expanded,
        }));
        return;
      }

      // Recursive expand/collapse when Cmd/Ctrl is pressed
      setExpandedPaths((prevExpandedPaths) => {
        const next = { ...prevExpandedPaths };
        const descendantPaths = getDescendantExpandablePaths(data, path);
        if (!expanded) {
          // expanding: include current path and all descendants
          next[path] = true;
          for (const p of descendantPaths) next[p] = true;
        } else {
          // collapsing: remove current path and all descendants
          delete next[path];
          for (const p of descendantPaths) delete next[p];
        }
        return next;
      });
    },
    [nodeHasChildNodes, setExpandedPaths, path, expanded, getDescendantExpandablePaths, data]
  );

  const handleMouseDown = useCallback(
    (event) => {
      onMouseDown?.(event, data, path);
    },
    [data, onMouseDown]
  );

  return (
    <TreeNode
      expanded={expanded}
      onClick={handleClick}
      // show arrow anyway even if not expanded and not rendering children
      shouldShowArrow={nodeHasChildNodes}
      // show placeholder only for non root nodes
      shouldShowPlaceholder={depth > 0}
      // Render a node from name and data (or possibly other props like isNonenumerable)
      nodeRenderer={nodeRenderer}
      {...props}
      onMouseDown={handleMouseDown}>
      {
        // only render if the node is expanded
        expanded
          ? [...dataIterator(data)].map(
              ({ name, data, ...renderNodeProps }) => {
                return (
                  <ConnectedTreeNode
                    name={String(name)}
                    data={data}
                    depth={depth + 1}
                    path={`${path}.${name}`}
                    key={name}
                    dataIterator={dataIterator}
                    nodeRenderer={nodeRenderer}
                    onMouseDown={onMouseDown}
                    {...renderNodeProps}
                  />
                );
              }
            )
          : null
      }
    </TreeNode>
  );
});

ConnectedTreeNode.propTypes = {
  name: PropTypes.string,
  data: PropTypes.any,
  dataIterator: PropTypes.func,
  depth: PropTypes.number,
  expanded: PropTypes.bool,
  nodeRenderer: PropTypes.func,
  onMouseDown: PropTypes.func,
};

const TreeView = memo(function TreeViewMemo({
  name,
  data,
  dataIterator,
  nodeRenderer,
  expandPaths,
  expandLevel,
  onMouseDown,
}) {
  const styles = useStyles('TreeView');
  const stateAndSetter = useState({});
  const [, setExpandedPaths] = stateAndSetter;

  useLayoutEffect(
    () =>
      setExpandedPaths((prevExpandedPaths) =>
        getExpandedPaths(
          data,
          dataIterator,
          expandPaths,
          expandLevel,
          prevExpandedPaths
        )
      ),
    [data, dataIterator, expandPaths, expandLevel]
  );

  return (
    <ExpandedPathsContext.Provider value={stateAndSetter}>
      <ol role="tree" style={styles.treeViewOutline}>
        <ConnectedTreeNode
          name={name}
          data={data}
          dataIterator={dataIterator}
          depth={0}
          path={DEFAULT_ROOT_PATH}
          nodeRenderer={nodeRenderer}
          onMouseDown={onMouseDown}
        />
      </ol>
    </ExpandedPathsContext.Provider>
  );
});

TreeView.propTypes = {
  name: PropTypes.string,
  data: PropTypes.any,
  dataIterator: PropTypes.func,
  nodeRenderer: PropTypes.func,
  expandPaths: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  expandLevel: PropTypes.number,
  /** Handler for mouse down */
  onMouseDown: PropTypes.func,
};

export default TreeView;
