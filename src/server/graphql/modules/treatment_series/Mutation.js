import safeParse from '../../../utils/safeParse';
import moment from 'moment';
import nodemailer from 'nodemailer';

import heMessages from '../../../../l10n/he.json';
import emailConfig from '../../../../../email.config';
import { roleOnly } from '../../utils/decorators';
import ROLES from '../../../../helpers/constants/roles';
import { pubsub } from '../../schema';

const { template: emailTemplate, ...mailerConfig } = emailConfig;

let transporter = nodemailer.createTransport(mailerConfig);

export default {
	@roleOnly(ROLES.THERAPIST)
	async createTreatmentSeries(_, seriesInput, { Treatments }) {
		const [id] = await Treatments.addSeries(seriesInput);
		const series = await Treatments.findOne(id);
		pubsub.publish('treatmentSeriesCreated', series);
		return series;
	},
	@roleOnly(ROLES.THERAPIST)
	async updateTreatmentSeries(_, seriesInput, { Treatments }) {
		await Treatments.editSeries(seriesInput);
		const series = await Treatments.findOne(seriesInput.id);
		pubsub.publish('treatmentSeriesUpdated', series);
		return series;
	},
	@roleOnly(ROLES.THERAPIST)
	async deleteTreatmentSeries(_, { id }, { Treatments }) {
		const series = await Treatments.findOne(id);
		const res = await Treatments.deleteSeries({ id });
		if (res) {
			pubsub.publish('treatmentSeriesDeleted', series);
			return res;
		}
	},

	@roleOnly(ROLES.THERAPIST)
	async createTreatmentSeriesObject(_, {
		series_id, object: {
			TreatmentInput, ...restObject,
		},
	}, { Treatments, Treatment, TreatmentSeries, TreatmentObject }) {

		let newObject;

		if (TreatmentInput) {
			let { repeat_weeks, ...treatment } = TreatmentInput;
			const isExists = await Treatments.isTreatmentExistsByTime(treatment.start_date, treatment.end_date);
			if (isExists) {
				throw new Error('Treatments.treatment_collided_error');
			}
			if (repeat_weeks) {
				while (repeat_weeks--) {
					let { start_date, end_date, ...fields } = treatment;
					start_date = moment.utc(start_date).add(repeat_weeks, 'weeks').format('YYYY-MM-DD HH:mm:ss');
					end_date = moment.utc(end_date).add(repeat_weeks, 'weeks').format('YYYY-MM-DD HH:mm:ss');
					await Treatments.addTreatment({ series_id, start_date, end_date, ...fields });
				}
			} else {
				await Treatments.addTreatment({ series_id, ...treatment });
			}
			newObject = {
				id: -1,
				...TreatmentInput,
			};
		} else if (Object.keys(restObject).length) {
			const { SchoolObservationInput, StaffMeetingInput, OutsideSourceConsultInput } = restObject;
			const { date, ...fields } = SchoolObservationInput || StaffMeetingInput || OutsideSourceConsultInput;
			const inserted = await TreatmentObject.query().insertAndFetch({
				series_id,
				date,
				fields,
			});
			newObject = { ...inserted, ...inserted.fields };
		}
		const series = await Treatments.findOne(series_id);
		pubsub.publish('treatmentSeriesUpdated', series);
		return newObject;
	},
	@roleOnly(ROLES.THERAPIST)
	async updateTreatmentSeriesObject(_, {
		id, object: {
			TreatmentInput, ...restObject,
		},
	}, context) {
		if (TreatmentInput) {
			let treatment = TreatmentInput;
			const isExists = await context.Treatments.isTreatmentExistsByTime(treatment.start_date, treatment.end_date, id);
			if (isExists) {
				throw new Error('Treatments.treatment_collided_error');
			}
			const oldTreatment = await context.Treatments.findOneTreatment(id);
			const currentUser = context.currentUser;
			return context.Treatments.editTreatment({
				id,
				...treatment
			})
				.then(async () => {
					treatment = await context.Treatments.findOneTreatment(id);
					const series = await context.Treatments.findOne(treatment.series_id);
					pubsub.publish('treatmentSeriesUpdated', series);

					let { related_persons, first_name, last_name } = await context.Users.findOne(series.patient_id);
					related_persons = safeParse(related_persons, []);

					related_persons.filter(person => person.receive_updates).forEach(person => {

						const templateConfig = {
							old_date: moment(oldTreatment.start_date).format('DD.MM.YYYY'),
							old_time: moment(oldTreatment.start_date).format('HH:mm'),
							new_time: moment(treatment.start_date).format('HH:mm'),
							new_date: moment(treatment.start_date).format('DD.MM.YYYY'),
							therapist_name: `${currentUser.first_name} ${currentUser.last_name}`,
							relative_name: person.name,
							patient_name: `${first_name} ${last_name}`,
						};

						let mailOptions = {
							from: `"Clinic" <${mailerConfig.auth.user}>`,
							to: person.email,
							subject: heMessages.Treatments.update_email.subject,
							html: emailTemplate(templateConfig),
						};

						transporter.sendMail(mailOptions).then(info => {
							console.log('Message %s sent: %s', info.messageId, info.response);
						});
					});

					return treatment;
				});
		} else if (Object.keys(restObject).length) {
			const { SchoolObservationInput, StaffMeetingInput, OutsideSourceConsultInput } = restObject;
			const { date, ...fields } = SchoolObservationInput || StaffMeetingInput || OutsideSourceConsultInput;
			const updatedTreatment = await context.TreatmentObject.query().updateAndFetchById(id, { date, fields });
			const series = await context.Treatments.findOne(updatedTreatment.series_id);
			pubsub.publish('treatmentSeriesUpdated', series);
			return {
				...updatedTreatment,
				...updatedTreatment.fields,
			};
		}
	},
	@roleOnly(ROLES.THERAPIST)
	async deleteTreatmentSeriesObject(_, { id, typename }, { Treatments, TreatmentObject }) {
		const treatment = typename === 'Treatment' ? await Treatments.findOneTreatment(id) : await TreatmentObject.query().findById(id);
		typename === 'Treatment' ? await Treatments.deleteTreatment({ id }) : await TreatmentObject.query().softDeleteById(id);
		const series = await Treatments.findOne(treatment.series_id);
		pubsub.publish('treatmentSeriesUpdated', series);
		return true;
	},
};
