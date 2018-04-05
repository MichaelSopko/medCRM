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
// // import 'fullcalendar/dist/fullcalendar.css';
// import * as fullcalendar_scheduler from 'fullcalendar-scheduler';
// /* eslint-disable import/no-unresolved */

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
		console.log(this.props);
		return(
			<div id={this.root}></div>
		)
	}
}
// import { isOption } from './utils';
//
//
// class FullCalendar extends React.Component {
// 	componentDidMount() {
// 		const { options, onDateChanged } = this.props;
//
// 		this.extendCalendarOptions = (calendarOptions) => {
// 			const defaultOptions = {
// 				viewRender(view) {
// 					const { intervalStart, intervalEnd } = view;
//
// 					const toDate = (momentDate) => momentDate.toDate();
//
// 					if (onDateChanged && typeof onDateChanged === 'function') {
// 						onDateChanged(toDate(intervalStart), toDate(intervalEnd));
// 					}
// 				},
// 			};
//
// 			return Object.assign({}, defaultOptions, calendarOptions);
// 		};
//
// 		this.calendar = $(this.refs['fullcalendar-container']);
//
// 		const calendarOptions = this.extendCalendarOptions(options);
//
// 		this.calendar.fullCalendar(calendarOptions);
// 	}
//
// 	componentWillReceiveProps(newProps) {
// 		const { options: newOptions } = newProps;
// 		const { options } = this.props;
//
//
// 		Object.keys(newOptions).forEach(optionName => {
// 			// update options dynamically
// 			if (isOption(optionName) && newOptions[optionName] !== options[optionName]) {
// 				this.calendar.fullCalendar('option', optionName, newOptions[optionName]);
// 			}
// 		});
//
// 		this.calendar.fullCalendar('refetchEvents');
// 		this.calendar.fullCalendar('changeView', newOptions.defaultView);
// 		this.calendar.fullCalendar('gotoDate', newOptions.defaultDate);
// 	}
//
// 	render() {
// 		return (
// 			<div ref="fullcalendar-container"></div>
// 		);
// 	}
// }
//
// FullCalendar.propTypes = {
// 	options: PropTypes.object,
// 	onDateChanged: PropTypes.func,
// };
//
// export {
// 	FullCalendar,
// };