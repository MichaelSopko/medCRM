import * as pdf  from 'html-pdf';
import * as fs from 'fs';
import * as _ from 'underscore';
import { app as settings } from '../../../package.json';
import User from '../sql/models/users';

const user = new User();
const pdfTemplate = fs.readFileSync('./templates/treaatment-summary-pdf', 'utf-8');

export default (req, res, next) => {
    const params = req.params;
    const timestamp = new Date().getTime();
    const template = _.template(pdfTemplate);
    
    user.getTreatmentSummaryById(params.recordId).then((result) => {
        console.log(result);
        console.log(params);
        console.log(`${settings.uploadsDir}/${timestamp}`);
        
        // pdf.create(template({}), {format: 'A3', orientation: 'portrait'}).toStream(() => {
        //
        // });
    
        res.send(template({}));
    }).catch(err => res.status(400).send(err));
};
