import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, message, Form, Input, notification, Col, Tabs } from 'antd';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import PatientObjectForm from '../components/PatientObjectForm';

import ADD_DIAGNOSE_MUTATION from '../graphql/addDiagnose.mutation.graphql';
import EDIT_DIAGNOSE_MUTATION from '../graphql/editDiagnose.mutation.graphql';

import './PatientObjectTab.scss';

@graphql(ADD_DIAGNOSE_MUTATION, {
    props: ({ ownProps, mutate }) => ({
        addDiagnose: (values) => mutate({
            variables: { input: { patient_id: ownProps.patient.id, ...values } },
        }),
    }),
})
@graphql(EDIT_DIAGNOSE_MUTATION, {
    props: ({ ownProps, mutate }) => ({
        editDiagnose: (id, values) => mutate({
            variables: { id, input: { patient_id: ownProps.patient.id, ...values } },
        }),
    }),
})
class DiagnoseTab extends Component {
    
    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };
    
    state = {
        formOpened: false,
        viewOpened: false,
        selectedItem: {},
        activeTabKey: 'firstTab',
    };
    
    openForm = () => {
        this.setState({ formOpened: true });
    };
    
    openEditForm = (selectedItem) => {
        this.setState({ formOpened: true, selectedItem });
    };
    
    closeForm = () => {
        this.setState({ formOpened: false, activeTabKey: 'firstTab' });
        setTimeout(() => {
            this.setState({ selectedItem: {} });
        }, 500);
    };
    
    openView = (selectedItem) => {
        this.setState({ viewOpened: true, selectedItem });
    };
    
    closeView = () => {
        this.setState({ viewOpened: false, selectedItem: {} });
    };
    
    onRowClick = (record, index, i, event) => {
        // dont edit when button clicked
        if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.parentNode.tagName === 'BUTTON') {
            return;
        }
        this.openEditForm(record);
    };
    
    renderPaginationPanel = (props) => {
        return (
            <div className="pagination-block">
                { props.components.pageList }
            </div>
        );
    };
    
    handleFormSubmit = () => {
        const formatMessage = this.context.intl.formatMessage;
        const form = this.form;
        
        form.validateFields((err, { hearing_test_trigger, ...values }) => {
            if (err) {
                return;
            }
            const isEditing = !!Object.keys(this.state.selectedItem).length;
            
            values.patient_age = moment.duration(values.patient_age).asMilliseconds();
            
            (!isEditing ? this.props.addDiagnose(values) :
                this.props.editDiagnose(this.state.selectedItem.id, values))
            .then((res) => {
                this.closeForm();
            }).catch(e => {
                console.error(e);
                notification.error(e);
            });
            
        });
    };
    
    onChangeKey = (activeKey) => {
        this.setState({ activeTabKey: activeKey });
    };
    
    editRender = (patient) => {
        return (cell, record) => {
            const formatMessage = this.context.intl.formatMessage;
            
            return (
                <span>
                    <Link to={`/print-object/${patient.id}/${record.id}`} target='_blank'>
                        <Button size='small'>{formatMessage({ id: 'common.action_print' })}</Button>
                    </Link>
                    <Link to={`/api/generate-pdf/${patient.id}/${record.id}`} target='_blank'>
                        <Button size='small'>PDF</Button>
                    </Link>
                </span>
            );
        };
    };
    
    dateRender = (cell, record) => {
        return (
            <span>
				{moment(record.date).format('LLL')}
			</span>
        );
    };
    
    print = () => {
        window.print();
    };
    
    renderFormFields = (form, object) => {
        const formatMessage = this.context.intl.formatMessage;
        const { getFieldDecorator } = form;
        const formItemLayout = {};
        
        return (
            <Tabs animated={false}
                  activeKey={this.state.activeTabKey}
                  onChange={this.onChangeKey}>
                <Tabs.TabPane key={'firstTab'} tab={formatMessage({ id: 'DiagnoseTab.tab1' })}>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.pregnancy_and_birth' })}>
                        {getFieldDecorator('fields.pregnancy_and_birth', {
                            rules: [],
                            initialValue: object.pregnancy_and_birth
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.psychomotor_progression' })}>
                        {getFieldDecorator('fields.psychomotor_progression', {
                            rules: [],
                            initialValue: object.psychomotor_progression
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.language_and_speech_progression' })}>
                        {getFieldDecorator('fields.language_and_speech_progression', {
                            rules: [],
                            initialValue: object.language_and_speech_progression
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.eating_function' })}>
                        {getFieldDecorator('fields.eating_function', {
                            rules: [],
                            initialValue: object.eating_function
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.family_background' })}>
                        {getFieldDecorator('fields.family_background', {
                            rules: [],
                            initialValue: object.family_background
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.health_background' })}>
                        {getFieldDecorator('fields.health_background', {
                            rules: [],
                            initialValue: object.health_background
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.past_and_present_treatments' })}>
                        {getFieldDecorator('fields.past_and_present_treatments', {
                            rules: [],
                            initialValue: object.past_and_present_treatments
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.environmental_context' })}>
                        {getFieldDecorator('fields.environmental_context', {
                            rules: [],
                            initialValue: object.environmental_context
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.parents_report' })}>
                        {getFieldDecorator('fields.parents_report', {
                            rules: [],
                            initialValue: object.parents_report
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.kindergarten_teacher_report' })}>
                        {getFieldDecorator('fields.kindergarten_teacher_report', {
                            rules: [],
                            initialValue: object.kindergarten_teacher_report
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                </Tabs.TabPane>
                <Tabs.TabPane key={'2'} tab={formatMessage({ id: 'DiagnoseTab.tab2' })}>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.diagnose_tools' })}>
                        {getFieldDecorator('fields.diagnose_tools', {
                            rules: [],
                            initialValue: object.diagnose_tools
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.behaviour_and_general_impression' })}>
                        {getFieldDecorator('fields.behaviour_and_general_impression', {
                            rules: [],
                            initialValue: object.behaviour_and_general_impression
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.communications_skills' })}>
                        {getFieldDecorator('fields.communications_skills', {
                            rules: [],
                            initialValue: object.communications_skills
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.gaming_skills' })}>
                        {getFieldDecorator('fields.gaming_skills', {
                            rules: [],
                            initialValue: object.gaming_skills
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.language_grasp' })}>
                        {getFieldDecorator('fields.language_grasp', {
                            rules: [],
                            initialValue: object.language_grasp
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.language_expression' })}>
                        {getFieldDecorator('fields.language_expression', {
                            rules: [],
                            initialValue: object.language_expression
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.speech_intelligibility' })}>
                        {getFieldDecorator('fields.speech_intelligibility', {
                            rules: [],
                            initialValue: object.speech_intelligibility
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.speech_fluency' })}>
                        {getFieldDecorator('fields.speech_fluency', {
                            rules: [],
                            initialValue: object.speech_fluency
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                </Tabs.TabPane>
                <Tabs.TabPane key={'3'} tab={formatMessage({ id: 'DiagnoseTab.tab3' })}>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.summary' })}>
                        {getFieldDecorator('fields.summary', {
                            rules: [],
                            initialValue: object.summary
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        hasFeedback
                        label={formatMessage({ id: 'DiagnoseTab.recommendations' })}>
                        {getFieldDecorator('fields.recommendations', {
                            rules: [],
                            initialValue: object.recommendations
                        })
                        (<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }}/>)}
                    </Form.Item>
                </Tabs.TabPane>
            </Tabs>
        );
    };
    
    render() {
        const { patient, addTreatmentSummary } = this.props;
        const { formOpened, viewOpened, selectedItem } = this.state;
        const formatMessage = this.context.intl.formatMessage;
        
        const options = {
            paginationPanel: this.renderPaginationPanel,
            onRowClick: this.onRowClick,
            prePage: 'Previous', // Previous page button text
            nextPage: 'Next', // Next page button text
            alwaysShowAllBtns: true,
            noDataText: formatMessage({ id: 'common.no_data' }),
        };
        
        return (
            <div className='PatientObjectTab'>
                <PatientObjectForm
                    ref={ form => {
                        this.form = form
                    } }
                    patient={patient}
                    onCancel={this.closeForm}
                    title={formatMessage({ id: 'DiagnoseTab.create_title' })}
                    visible={formOpened}
                    showHearingTest
                    renderFields={this.renderFormFields}
                    object={selectedItem}
                    activeKey={this.state.activeTabKey}
                    onChangeKey={this.onChangeKey}
                    onSubmit={this.handleFormSubmit}/>
                <div className='PatientObjectTab__Actions'>
                    <Button onClick={this.openForm} type='primary'>
                        {formatMessage({ id: 'DiagnoseTab.create_title' })}
                    </Button>
                </div>
                
                <BootstrapTable data={patient.diagnoses} keyField='id' hover consended
                                options={options} pagination>
                    <TableHeaderColumn dataField='date' dataFormat={this.dateRender}
                                       dataSort caretRender={ getCaret }>
                        {formatMessage({ id: 'Treatments.field_datetime' })}
                    </TableHeaderColumn>
                    <TableHeaderColumn width="100px" dataFormat={this.editRender(patient)}>
                        {formatMessage({ id: 'common.field_actions' })}
                    </TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
    }
}

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

export default DiagnoseTab;
