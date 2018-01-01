/* eslint react/no-danger:0 */
import React from 'react';
import './SvgImg.scss';

const SvgImageFilter = (props) => {
  const filterStrength = props.filterStrength;
  const svgFilterContainer = `<defs>
                        <filter id="blurlayer">
                            <feGaussianBlur  stdDeviation="${filterStrength}" result="blur"/>
                            <feImage id="feimage" xlink:href="data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogPGc+DQogIDx0aXRsZT5iYWNrZ3JvdW5kPC90aXRsZT4NCiAgPHJlY3QgZmlsbD0ibm9uZSIgaWQ9ImNhbnZhc19iYWNrZ3JvdW5kIiBoZWlnaHQ9IjMwMiIgd2lkdGg9IjEwMjYiIHk9Ii0xIiB4PSItMSIvPg0KIDwvZz4NCg0KIDxnPg0KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+DQogIDxyZWN0IGlkPSJzdmdfMSIgaGVpZ2h0PSIxMzMiIHdpZHRoPSIxMDI0IiB5PSI4NC41IiB4PSIwIiBmaWxsLW9wYWNpdHk9Im51bGwiIHN0cm9rZS1vcGFjaXR5PSJudWxsIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSJudWxsIiBmaWxsPSIjMDAwMDAwIi8+DQogPC9nPg0KPC9zdmc+" x="103px" y="93px" width="200px" height="100%" result="mask"/>
            
            <feComposite in2="mask" in="blur"  operator="in" result="comp" />
            
            <feMerge result="merge">
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="comp" />
            </feMerge> 
                        </filter>
                     </defs>`;

  return (
      <svg dangerouslySetInnerHTML={{ __html: svgFilterContainer }} className="SvgImg" />
  );
};

export default SvgImageFilter;
