export default {
	async participants(obj, args, { TreatmentObject, Users }) {
		if (obj.participant_ids) {
			const realIds = obj.participant_ids.filter(Number);
			const fakeIds = obj.participant_ids.filter(id => !realIds.some(realId => realId === id));
			const realParticipants = await Users.getUsers(realIds);
			const fakeParticipants = fakeIds.map(id => ({
				id,
				first_name: id,
				last_name: '',
			}));
			return [...realParticipants, ...fakeParticipants];
		} else {
			return [];
		}
	},
	meetingPurpose(obj) {
		return obj.meetingPurpose || null;
	}
};
