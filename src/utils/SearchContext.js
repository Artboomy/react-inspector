import { useContext, createContext } from 'react';

const SearchContext = createContext({
  value: '',
  hideUnrelated: false,
  caseSensitive: false,
});

export default SearchContext;

// TODO: naming is a mess, to rename and streamline

export const useSearchParams = () => {
  const { value, caseSensitive, hideUnrelated } = useContext(SearchContext);
  const symbol = value
    ? Symbol.for(
        `${caseSensitive ? value : value.toLowerCase()}.${caseSensitive}`
      )
    : null;
  const comparator = caseSensitive ? caseSensitiveMatch : caseInsensitiveMatch;
  const searchValue = value
    ? caseSensitive
      ? value
      : value.toLowerCase()
    : null;
  const marker = createMarker(comparator, searchValue);
  return { symbol, marker, hideUnrelated };
};

const noValueCheckSymbol = Symbol('noValueCheckSymbol');

export const createMarker = (comparator, searchValue) => (k, v) => {
  const byKey = comparator(String(k), searchValue);
  if (v === noValueCheckSymbol) {
    return byKey;
  }
  let byValue;
  if (v === null) {
    byValue = searchValue === 'null';
  } else if (v === undefined) {
    byValue = searchValue === 'undefined';
  } else if (typeof v === 'boolean') {
    byValue = String(v) === searchValue;
  } else {
    byValue = comparator(String(v), searchValue);
  }
  return byKey || byValue;
};

export function isVisible(graph, key, marker) {
  const item = graph[key];
  let shouldShow;
  if (item && typeof item === 'object') {
    if (item instanceof Date) {
      shouldShow = marker(key, String(item));
    } else if (Array.isArray(item)) {
      shouldShow =
        marker(key, noValueCheckSymbol) ||
        item.map((_, idx) => isVisible(item, idx, marker)).some((t) => t);
    } else {
      shouldShow = Object.keys(item)
        .map((key) => isVisible(item, key, marker))
        .some((t) => t);
    }
  } else {
    //invoke marker
    shouldShow = marker(key, item);
  }
  return shouldShow;
}

export function markMatches(graph, key, marker, symbol) {
  const item = graph[key];
  let shouldShow;
  if (item && typeof item === 'object') {
    if (item instanceof Date) {
      shouldShow = marker(key, String(item));
    } else if (Array.isArray(item)) {
      shouldShow = item
        .map((_, idx) => markMatches(item, idx, marker, symbol))
        .some((t) => t);
      shouldShow = marker(key, noValueCheckSymbol) || shouldShow;
    } else {
      shouldShow = Object.keys(item)
        .map((key) => markMatches(item, key, marker, symbol))
        .some((t) => t);
    }
  } else {
    //invoke marker
    shouldShow = marker(key, item);
  }
  const symbols = Object.getOwnPropertySymbols(graph);
  symbols.forEach((addedSymbol) => {
    if (addedSymbol !== symbol) {
      delete graph[addedSymbol];
    }
  });
  if (!Object.prototype.hasOwnProperty.call(graph, symbol)) {
    //create empty
    Object.defineProperty(graph, symbol, {
      value: shouldShow ? [key] : [],
      configurable: true,
      enumerable: false,
    });
  } else {
    //append
    if (shouldShow) {
      graph[symbol].push(key);
    }
  }
  return shouldShow;
}

export const caseSensitiveMatch = (str, value) => {
  return str.includes(value);
};

export const caseInsensitiveMatch = (str, lowercaseValue) => {
  return str.toLowerCase().includes(lowercaseValue);
};
