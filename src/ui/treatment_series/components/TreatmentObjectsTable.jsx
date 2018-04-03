import { Table, Icon, Button, Modal, Tag, Popconfirm } from 'antd';import moment from 'moment';
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

export const colorsMap = {
	'Treatment': 'grey',
	'SchoolObservation': 'cyan',
	'StaffMeeting': 'blue',
	'OutsideSourceConsult': 'purple',
};

export const TreatmentObjectsTable = ({ treatments, deleteObject, updateObject, formatMessage }) => {
	
	function getCaret(direction) {
		if (direction === 'asc') {
			return (
				<span className="fa fa-sort-amount-asc"></span>
			);
		}
		if (direction === 'desc') {
			return (
				<span className="fa fa-sort-amount-desc"></span>
			);
		}
		return (
			<span className="fa fa-exchange fa-rotate-90"></span>
		);
	}
	
	const renderIndex = (text, record) => {
		return treatments.indexOf(record) + 1;
	};
	
	const editRender = (cell, record) => {
		const onDelete = () => {
			deleteObject(record);
		};
		
		const checkForConfirm = () => Modal.confirm({
			title: formatMessage({id: 'common.confirm_message'}),
			okText: formatMessage({id: 'common.confirm_yes'}),
			cancelText: formatMessage({id: 'common.confirm_no'}),
			onOk: onDelete,
		});
		
		return (
			<span>
				<Button size="small" className="btn-actions btn-danger" onClick={checkForConfirm}
						type='ghost'>{formatMessage({id: 'common.action_delete'})}</Button>
			</span>
		);
	};
	
	const onRowClick = (record, index, i, event) => {
		// dont edit when button clicked
		if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.parentNode.tagName === 'BUTTON') {
			return;
		}
		updateObject(record);
	};
	
	const renderLabel = (text, record) => (
		<Tag color={colorsMap[record.__typename]}>
			{formatMessage({ id: `Treatments.object_label_name.${record.__typename}` })}
		</Tag>
	);
	
	const renderHeader = (text, record) => (
		<div className='to-dynamic-container'>
			<span className='to-dynamic'>{moment(record.start_date || record.date).utc().format('ddd, Do MMMM LT')}</span>
		</div>
	);
	
	const renderPaginationPanel = (props) => {
		return (
			<div className="pagination-block">
				{ props.components.pageList }
			</div>
		);
	};
	
	const renderTherapist = (text, record) => (
		<div className='to-dynamic-container'>
				<span
					className='to-dynamic'>{
					(record.therapists || record.participants || []).map(user => `${user.first_name} ${user.last_name}`).join(', ')
				}</span>
		</div>
	);
	
	const options = {
		onRowClick,
		renderPaginationPanel,
		prePage: 'Previous', // Previous page button text
		nextPage: 'Next', // Next page button text
		alwaysShowAllBtns: true,
	};
	
	treatments = treatments.map((record) => {
		console.log(record);
		return  Object.assign({}, record, {
			therapistName: (record.therapists || record.participants || []).map(user => `${user.first_name} ${user.last_name}`).join(', '),
			index: treatments.indexOf(record) + 1
		});
	});
	
	return (
		<div>
			<BootstrapTable data={treatments} keyField="id" hover consended pagination options={options}>
				<TableHeaderColumn width="100px" dataField="index" dataSort dataFormat={renderIndex} caretRender={getCaret}>{formatMessage({ id: 'common.field_id' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="label" dataFormat={renderLabel} dataSort caretRender={getCaret}>{formatMessage({ id: 'common.field_type' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="date" dataFormat={renderHeader} dataSort caretRender={getCaret}>{formatMessage({ id: 'Treatments.field_start_date_header' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="therapistName" dataSort dataFormat={renderTherapist} caretRender={getCaret}>{formatMessage({ id: 'Treatments.field_therapists' })}</TableHeaderColumn>
				<TableHeaderColumn width="100px" dataFormat={editRender}>{formatMessage({ id: 'common.field_actions' })}</TableHeaderColumn>
			</BootstrapTable>
		</div>
	);
};
