import React from 'react';
import ObjectName from '../object/ObjectName';
import ObjectPreview from './ObjectPreview';
import { useSearchParams } from '../utils/SearchContext';

const ObjectRootLabel = ({ name, data }) => {
  const { symbol } = useSearchParams();
  if (typeof name === 'string') {
    return (
      <span>
        <ObjectName name={name} />
        <span>: </span>
        <ObjectPreview data={data} />
      </span>
    );
  } else {
    return <ObjectPreview data={data} symbol={symbol} />;
  }
};

export default ObjectRootLabel;
