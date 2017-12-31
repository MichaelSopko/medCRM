/* eslint react/no-danger:0 */
import React from 'react';
import './SvgImg.scss';

const SvgImageFilter = (props) => {
  const filterStrength = props.filterStrength;
  const svgFilter = `<<defs>
                                  <filter id="blurlayer">
                                    
                                    <feGaussianBlur  stdDeviation="${filterStrength}" result="blur"/>
                                  
                                  </filter>
                       </defs>`;

  return (
    <svg dangerouslySetInnerHTML={{ __html: svgFilter }} />
  );
};

export default SvgImageFilter;
