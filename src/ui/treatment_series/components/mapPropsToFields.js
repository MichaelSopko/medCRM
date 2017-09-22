import moment from 'moment';

export default props => {
	let values = { ...props.values } || {};
	Object.keys(values).forEach(key => {
		values[key] = { value: key === 'date' ? moment(values[key]) : values[key] };
	});
	return values;
};
