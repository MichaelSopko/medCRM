export default {
	clinic(user, _, { Clinic }) {
		return Clinic.query().findById(user.clinic_id);
	},
}
