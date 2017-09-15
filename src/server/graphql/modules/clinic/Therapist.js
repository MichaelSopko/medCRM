export default {
	clinic(user, _, { Clinic }) {
		return Clinic.query().where('id', user.clinic_id).first();
	},
};
