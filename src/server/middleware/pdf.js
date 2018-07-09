import * as pdf from 'html-pdf';
import * as fs from 'fs';
import * as _ from 'underscore';
import moment from 'moment';
import User from '../sql/models/users';
import enMessages from '../../l10n/en.json';
import heMessages from '../../l10n/he.json';

const user = new User();
const pdfTemplate = fs.readFileSync('./templates/treaatment-summary-pdf.html', 'utf-8');

function flattenMessages(nestedMessages, prefix = '') {
    return Object.keys(nestedMessages).reduce((messages, key) => {
        const value = nestedMessages[key];
        const prefixedKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
            messages[prefixedKey] = value;
        } else {
            Object.assign(messages, flattenMessages(value, prefixedKey));
        }
        
        return messages;
    }, {});
}

const safeParse = (json, deflt = []) => {
    try {
        return JSON.parse(json || `${deflt}`);
    } catch (e) {
        console.log('JSON parse error');
        return deflt;
    }
};

export default (req, res, next) => {
    const params = req.params;
    const template = _.template(pdfTemplate);
    const locale = !__DEV__ ? 'en' : 'he';
    let messages = locale === 'he' ? heMessages : enMessages;
    
    messages = flattenMessages(messages);
    
    function formatMessage({ id }) {
        return messages[id] || id;
    }
    
    user.findOne(params.patientId).then((patient) => {
        user.getTreatmentSummaryById(params.recordId).then((result) => {
            const object = result[0];
            const ageDiff = object && moment.duration(parseInt(object.patient_age, 10));
            let ageDiffStr = '';
            if (ageDiff.years()) {
                ageDiffStr = +ageDiff.years() + ' years ';
            }
            if (ageDiff.months()) {
                ageDiffStr += +ageDiff.months() + ' month ';
            }
            if (ageDiff.days()) {
                ageDiffStr += +ageDiff.days() + ' days';
            }
    
            patient.related_persons = JSON.parse(patient.related_persons);
            const fillers = safeParse(object.fillers_ids, '[]') || [];
            
            user.getUsers(fillers).then((realFillers) => {
                object.fillers = realFillers;
                object.fields = safeParse(object.fields, '{}');
                
                pdf.create(
                    template({
                        patient, object, moment, ageDiff: ageDiffStr, formatMessage, locale,
                    }),
                    { format: 'A3', orientation: 'portrait' },
                ).toStream((err, stream) => {
                    if (err) {
                        return next(err);
                    }
        
                    res.setHeader('Content-disposition', 'inline');
                    res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
        
                    return stream.pipe(res);
                });
            }).catch(err => res.status(400).send(err));
        }).catch(err => res.status(400).send(err));
    }).catch(err => res.status(400).send(err));
};
