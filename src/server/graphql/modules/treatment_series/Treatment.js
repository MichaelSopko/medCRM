import safeParse from '../../../utils/safeParse';

export default {
	therapists(treatment, _, { Users }) {
		return treatment && treatment.therapists || Users.getUsers(safeParse(treatment.therapist_ids));
	},
};
