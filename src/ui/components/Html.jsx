import React, { PropTypes } from 'react'
import { locale } from '../../../config.json';
import cx from 'classnames';

const Html = ({ content, state, assetMap }) => {
	const isRtl = locale === 'he';
	return (
		<html lang={locale}>
		<head>
			<meta charSet="utf-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1"/>
			<title>Clinic</title>
			{!__DEV__ && <link rel="stylesheet" type="text/css" href={`/assets/${assetMap['bundle.css']}`}/>}
			{__DEV__ &&
			<style dangerouslySetInnerHTML={{
				__html: require('../styles.scss')._getCss()
			}}/>
			}
			<link rel="shortcut icon" href="/favicon.ico"/>
		</head>
		<body className={ cx({ 'rtl': isRtl }) }>
		<div id="content" dangerouslySetInnerHTML={{ __html: content }}/>
		<script
			dangerouslySetInnerHTML={{ __html: `window.__APOLLO_STATE__=${JSON.stringify(state)};` }}
			charSet="UTF-8"
		/>
		{assetMap["vendor.js"] && <script src={`/assets/${assetMap["vendor.js"]}`} charSet="utf-8" />}
		<script src={`${ __DEV__ ? '/' : '/assets'}/${assetMap['bundle.js']}`} charSet="utf-8" />
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
