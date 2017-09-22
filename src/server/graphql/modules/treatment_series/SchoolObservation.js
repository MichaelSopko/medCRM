export default {
	async therapists(obj, args, { TreatmentObject, Users }) {
		if (obj.therapist_ids) {
			return Users.getUsers(obj.therapist_ids);
		} else {
			return [];
		}
	}
}
