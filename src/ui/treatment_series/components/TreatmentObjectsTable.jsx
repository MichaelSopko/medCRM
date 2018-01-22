import { Table, Popconfirm, Button, Tag } from 'antd';
import moment from 'moment';
import React from 'react';


export const colorsMap = {
	'Treatment': 'grey',
	'SchoolObservation': 'cyan',
	'StaffMeeting': 'blue',
	'OutsideSourceConsult': 'purple',
};

export const TreatmentObjectsTable = ({ treatments, deleteObject, updateObject, formatMessage }) => {
	const columns = [
		{
			title: '',
			key: 'label',
			width: '15%',
			render: (text, record) => <Tag color={colorsMap[record.__typename]}>
				{formatMessage({ id: `Treatments.object_label_name.${record.__typename}` })}
			</Tag>,
		},
		{
			title: formatMessage({ id: 'Treatments.field_start_date_header' }),
			key: 'date',
			width: '35%',
			sorter: (a, b) => moment(a.start_date || a.date).valueOf() > moment(b.start_date || b.date).valueOf(),
			render: (text, record) => <div className='to-dynamic-container'>
				<span className='to-dynamic'>{moment(record.start_date || record.date).format('ddd, Do MMMM LT')}</span>
			</div>,
		},
		{
			title: formatMessage({ id: 'Treatments.field_therapists' }),
			width: '25%',
			render: (text, record) => <div className='to-dynamic-container'>
				<span
					className='to-dynamic'>{
					(record.therapists || record.participants || []).map(user => `${user.first_name} ${user.last_name}`).join(', ')
				}</span>
			</div>,
		},
		{
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '25%',
			render: (text, record) => (
				<span>
{/*		      <a onClick={() => updateObject(record)}>{formatMessage({ id: 'common.action_edit' })}</a>
					<span className='ant-divider' />*/}
		      <Popconfirm
			      title={formatMessage({ id: 'common.confirm_message' })}
			      onConfirm={() => deleteObject(record)}
			      okText={formatMessage({ id: 'common.confirm_yes' })}
			      cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <a>{formatMessage({ id: 'common.action_delete' })}</a>
		      </Popconfirm>
        </span>
			),
		},
	];
	return <Table
		dataSource={treatments}
		onRowClick={(record, index, event) => {
			// dont edit when button clicked
			if(event.target.tagName === 'BUTTON' || event.target.tagName === 'A'  || event.target.parentNode.tagName === 'BUTTON') {
				return;
			}
			updateObject(record);
		}}
		columns={columns}
		rowKey={item => item.id + item.__typename} />;
};
