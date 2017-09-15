export default {
	related_persons(user, _, ctx) {
		return safeParse(user.related_persons);
	},
	files(user, _, ctx) {
		return ctx.Users.getPatientFiles(user.id);
	},
	diagnoses(user, _, ctx) {
		return ctx.Users.getDiagnoses(user.id);
	},
	treatment_summary(user, _, ctx) {
		return ctx.Users.getTreatmentSummary(user.id);
	},
};
