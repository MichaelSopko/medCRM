export default {
	async participants(obj, args, { TreatmentObject, Users }) {
		if (obj.participant_ids) {
			return Users.getUsers(obj.participant_ids);
		} else {
			return [];
		}
	}
}
