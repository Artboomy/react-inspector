import { createContext, useContext } from 'react';
import SearchContext from './SearchContext';

const HighlightContext = createContext('');

export default HighlightContext;

export const useHighlight = (isDimmed) => {
  const highlightValue = useContext(HighlightContext);
  const { caseSensitive } = useContext(SearchContext);
  const { value: searchValue } = useContext(SearchContext);
  if (isDimmed) {
    return null;
  }
  const rawValue = highlightValue || searchValue;
  const value = caseSensitive
    ? rawValue
    : typeof rawValue === 'string'
    ? rawValue.toLowerCase()
    : rawValue;
  return value;
};
