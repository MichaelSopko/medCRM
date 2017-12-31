/* eslint react/no-danger:0 */
import React from 'react';
import './SvgImg.scss';

const SvgImageFilter = (props) => {
  const filterStrength = props.filterStrength;
  const svgFilter = `<defs><filter id="blurlayer" width="110%" height="100%"><feGaussianBlur  stdDeviation="25"/></filter></defs>`;

  return (
    <svg dangerouslySetInnerHTML={{ __html: svgFilter }} className="SvgImg" />
  );
};

export default SvgImageFilter;
