import React, { PropTypes } from 'react'
import config from '../../../config';
import cx from 'classnames';

const Html = ({ content, state, assetMap }) => {
	const isRtl = config.locale === 'he';
	return (
		<html lang={config.locale}>
		<head>
			<meta charSet="utf-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1"/>
			<title>Clinic</title>

			<link rel="apple-touch-icon" sizes="180x180" href={`/${assetMap["apple-touch-icon.png"]}`}/>
			<link rel="icon" type="image/png" href={`/${assetMap["favicon-32x32.png"]}`} sizes="32x32"/>
			<link rel="icon" type="image/png" href={`/${assetMap["favicon-16x16.png"]}`} sizes="16x16"/>
			<link rel="manifest" href={`/${assetMap["manifest.json"]}`}/>
			<link rel="mask-icon" href={`/${assetMap["safari-pinned-tab.svg"]}`} color="#5bbad5"/>
			<link rel="shortcut icon" href={`/${assetMap["favicon.ico"]}`} />
			<meta name="msapplication-config" content={`/${assetMap["browserconfig.xml"]}`} />
			<meta name="theme-color" content="#ffffff"/>
			<script src={`/${assetMap["analytics.js"]}`}></script>
			{!__DEV__ && <link rel="stylesheet" type="text/css" href={`/${assetMap['bundle.css']}`} />}
			{__DEV__ &&
			<style dangerouslySetInnerHTML={{ __html:
				require('../styles.scss')._getCss()
			}}/>
			}

		</head>
		<body className={ cx({ 'rtl': isRtl }) }>
		<div id="content" dangerouslySetInnerHTML={{ __html: content }}/>
		<script
			dangerouslySetInnerHTML={{ __html: `window.__APOLLO_STATE__=${JSON.stringify(state)};` }}
			charSet="UTF-8"
		/>
		{assetMap["vendor.js"] && <script src={`/${assetMap["vendor.js"]}`} charSet="utf-8" />}
		<script src={`/${assetMap['bundle.js']}`} charSet="utf-8" />
		</body>
		</html>
	);
};

Html.propTypes = {
	content: PropTypes.string.isRequired,
	state: PropTypes.object.isRequired,
	assetMap: PropTypes.object.isRequired
};

export default Html;
