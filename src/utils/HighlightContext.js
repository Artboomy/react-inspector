import { createContext, useContext } from 'react';
import SearchContext from './SearchContext';

const HighlightContext = createContext('');

export default HighlightContext;

export const useHighlight = (isDimmed) => {
  const highlightValue = useContext(HighlightContext);
  const { value: searchValue } = useContext(SearchContext);
  return isDimmed ? null : highlightValue || searchValue;
};
