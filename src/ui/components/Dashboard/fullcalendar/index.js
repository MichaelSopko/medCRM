import React from 'react';
import PropTypes from 'prop-types';

// /* eslint-disable import/no-unresolved */

import * as $ from 'jquery';
// console.log(global === window );
if (typeof $.extend === 'function') {
	import('fullcalendar')
			.then((something) => {
				console.log(something.something);
			});
}

import FullcalendarObjectMapper from './fullcalendarObjectMapper';

export default class FullCalendar extends React.Component{
	constructor(){
		super();
		this.jq = $.noConflict();
		this.fullcalendarObjectMapper = new FullcalendarObjectMapper();
		this.root = null;
		this.instance = null;
		this.date = new Date();
	}
	
	componentDidMount(){
		const objectMapperSettings = this.fullcalendarObjectMapper.getSettings(this.props);
		this.instance = this.jq(`#${this.root}`).fullCalendar(objectMapperSettings);
	}
	
	componentWillReceiveProps(nextProps){
		this.jq(`#${this.root}`).fullCalendar('destroy');
		const objectMapperSettings = this.fullcalendarObjectMapper.getSettings(nextProps);
		this.instance = this.jq(`#${this.root}`).fullCalendar(objectMapperSettings);
	}
	
	render(){
		this.root = this.props.id || 'ID' + this.date.getTime();
		return(
			<div id={this.root}></div>
		)
	}
}
