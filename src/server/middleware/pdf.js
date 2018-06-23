import * as pdf from 'html-pdf';
import * as fs from 'fs';
import * as _ from 'underscore';
import User from '../sql/models/users';

const user = new User();
const pdfTemplate = fs.readFileSync('./templates/treaatment-summary-pdf.html', 'utf-8');

export default (req, res, next) => {
    const params = req.params;
    const template = _.template(pdfTemplate);
    
    user.getTreatmentSummaryById(params.recordId).then((result) => {
        const data = result[0];

        console.log(data);
        
        pdf.create(template({ data }), { format: 'A3', orientation: 'portrait' }).toStream((err, stream) => {
            if (err) {
                return next(err);
            }
            
            res.setHeader('Content-disposition', 'inline');
            res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
    
            return stream.pipe(res);
        });
    }).catch(err => res.status(400).send(err));
};
