import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ObjectInspector from '../object-inspector/ObjectInspector';

let container;

const click = (el, opts = {}) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...opts });
  el.dispatchEvent(event);
};

const findFirstLevelPreviewDivByName = (root, name) => {
  // Query first-level children preview divs under the root treeitem explicitly
  const firstLevelDivs = Array.from(
    root.querySelectorAll('ol[role="tree"] > li[role="treeitem"] > ol[role="group"] > li[role="treeitem"] > div')
  );
  return firstLevelDivs.find((div) => {
    const text = (div.textContent || '').replace(/\s+/g, ' ').trim();
    // Match by containing the name and a colon somewhere near the start
    return text.includes(`${name}:`);
  });
};

const countTreeItems = (root) => root.querySelectorAll('li[role="treeitem"]').length;

describe('TreeView recursive expand/collapse via Cmd/Ctrl-click', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  });

  it('recursively expands all descendants on Cmd/Ctrl-click, and collapses them on second Cmd/Ctrl-click', () => {
    const data = { a: { b: { c: 1 }, d: 2 }, e: 3 };

    act(() => {
      render(<ObjectInspector data={data} />, container);
    });

    // Initially only the root treeitem should be present
    expect(countTreeItems(container)).toBe(1);

    // Click the root preview div with metaKey (Cmd) to recursively expand everything
    const rootPreviewDiv = container.querySelector('li[role="treeitem"] > div');
    act(() => {
      click(rootPreviewDiv, { metaKey: true });
    });

    // Now all descendants should be rendered; expect multiple tree items
    expect(countTreeItems(container)).toBeGreaterThan(1);
    // Deep leaf should now be visible
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('b');
    expect(container.textContent).toContain('c');

    // Cmd/Ctrl-click the root again to collapse everything recursively
    act(() => {
      click(rootPreviewDiv, { metaKey: true });
    });

    // Back to only the root tree item
    expect(countTreeItems(container)).toBe(1);
    // Deep keys are no longer visible
    expect(container.textContent).not.toContain('c');
  });

  it('non-recursive click expands only a single level; recursive click on a node expands its subtree fully', () => {
    const data = { a: { b: { c: 1 }, d: 2 }, e: 3 };

    act(() => {
      render(<ObjectInspector data={data} />, container);
    });

    // Regular click on root: expands first level only
    const rootPreviewDiv = container.querySelector('li[role="treeitem"] > div');
    act(() => {
      click(rootPreviewDiv); // no modifiers
    });

    // First level keys should be visible, but deep descendants not yet
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('e');
    expect(container.textContent).not.toContain('c');

    // Find preview div for node "a" and Cmd/Ctrl-click it to expand its whole subtree
    const aPreviewDiv = findFirstLevelPreviewDivByName(container, 'a');
    expect(aPreviewDiv).toBeTruthy();

    act(() => {
      // Prefer metaKey, fall back to ctrlKey if environment ignores metaKey
      click(aPreviewDiv, { metaKey: true });
    });

    // After recursive expand on "a", deep leaf "c" should be visible
    expect(countTreeItems(container)).toBeGreaterThan(2);
    expect(container.textContent).toContain('b');
    expect(container.textContent).toContain('c');
  });
});
