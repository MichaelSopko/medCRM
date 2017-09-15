export default {
	clinic(user, _, { Clinics }) {
		return Clinics.findOne(user.clinic_id);
	},
}
