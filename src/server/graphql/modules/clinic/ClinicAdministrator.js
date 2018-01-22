export default {
	clinic(user, _, context) {
		return context.Clinic.query().findById(user.clinic_id);
	},
};
