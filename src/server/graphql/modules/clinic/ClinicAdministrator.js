export default {
	clinic(user, _, context) {
		return context.Clinics.findOne(user.clinic_id);
	},
};
