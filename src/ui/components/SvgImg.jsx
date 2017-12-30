/* eslint react/no-danger:0 */
import React from 'react';
import './SvgImg.scss';

const SvgImageFilter = (props) => {
    const filterStrength = props.filterStrength;
    const svgFilter = `<defs><filter id="filtersPicture"><feGaussianBlur stdDeviation="${filterStrength}" /></filter></defs>`;
    return (
        <svg className="SvgImg" dangerouslySetInnerHTML={{ __html: svgFilter }} />
    );
};

export default SvgImageFilter;
