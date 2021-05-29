import { createContext } from 'react';

const SearchContext = createContext({ value: '', hideUnrelated: false });

export default SearchContext;

export const createSearchSymbol = () => Symbol();

export function markMatches(graph, key, marker, symbol) {
  const item = graph[key];
  let shouldShow;
  if (item && typeof item === 'object') {
    //iterate
    if (Array.isArray(item)) {
      shouldShow = item
        .map((_, idx) => markMatches(item, idx, marker, symbol))
        .some((t) => t);
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
