import React, { PropTypes } from 'react';
import { Modal, Button, Col, Row } from 'antd';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import './PatientObjectView.scss';

const PatientObjectView = (props, context) => {
	const formatMessage = context.intl.formatMessage;
	const { object, patient, renderFields, showHearingTest, ...modalProps } = props;
	const ageDiff = object && moment.duration(object.patient_age);

	const { __typename, ...fields } = object.fields || {};

	return (
		<Modal
			className='PatientObjectView'
			cancelText={formatMessage({id: 'common.action_cancel'})}
			okText={formatMessage({id: 'common.action_print'})}
			closable={false}
			width={1024}
			{...modalProps}>
			{ object && Object.keys(object).length && <Row>
				<Col span={12}>
					<table className='PatientObjectView__Table'>
						<tr>
							<td>{formatMessage({id: 'Patients.patient_name'})}:</td>
							<td>{patient.first_name} {patient.last_name}</td>
						</tr>
						<tr>
							<td>{formatMessage({id: 'Patients.field_health_maintenance'})}:</td>
							<td>{formatMessage({id: `health_maintenance.${patient.health_maintenance}`})}</td>
						</tr>
						<tr>
							<td>ID#:</td>
							<td>{patient.id_number}</td>
						</tr>
						<tr>
							<td>{formatMessage({ id: 'common.gender.field_name' })}:</td>
							<td>{formatMessage({id: `common.gender.${patient.gender}`})}</td>
						</tr>
						<tr>
							<td>Relatives</td>
							<td>
								<ol>
									{patient.related_persons.map(prsn => (
										<li>{formatMessage({id: `related_persons.${prsn.type}`})}, {prsn.description}</li>
									))}
								</ol>
							</td>
						</tr>
						<tr>
							<td>{formatMessage({ id: 'Patients.diagnose_fillers' })}:</td>
							<td>
								<ul>
									{object.fillers.map(flr => (
										<li>{flr.first_name} {flr.last_name}, {formatMessage({id: 'common.field_licence'})} {flr.license_number}, {formatMessage({id: `roles.${flr.role}`})}</li>
									))}
								</ul>
							</td>
						</tr>
					</table>
				</Col>
				<Col span={12}>
					<table className='PatientObjectView__Table'>
						<tr>
							<td>{formatMessage({ id: 'Patients.diagnose_date' })}:</td>
							<td>{moment(object.date).format('L')}</td>
						</tr>
						<tr>
							<td>{formatMessage({ id: 'Patients.age_in_diagnose' })}:</td>
							<td>
								<FormattedMessage id='Patients.age' values={{
									years: ageDiff.years() || '0',
									months: ageDiff.months() || '0',
									days: ageDiff.days() || '0',
								}} />
							</td>
						</tr>
						{ showHearingTest && <tr>
							<td>{formatMessage({ id: 'Patients.hearing_test' })}:</td>
							<td>
								<p>{object.hearing_test_remark}</p>
								<strong>{moment(object.hearing_test_date).format('L')}</strong>
							</td>
						</tr> }
						<tr>
							<td>{formatMessage({ id: 'Patients.print_date' })}:</td>
							<td>{moment().format('L')}</td>
						</tr>
					</table>
				</Col>
			</Row> }
			<Row>
				{renderFields && fields && renderFields(fields)}
			</Row>
		</Modal>
	);
};

PatientObjectView.contextTypes = {
	intl: PropTypes.object.isRequired,
}

export default PatientObjectView;