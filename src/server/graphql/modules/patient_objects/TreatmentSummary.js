import safeParse from '../../../utils/safeParse';

export default {
	async fillers(diagnose, _, context) {
		if (!diagnose || !diagnose.fillers_ids) return [];
		const fillers = safeParse(diagnose.fillers_ids, '[]') || [];
		const customFillers = fillers.filter(flr => isNaN(parseInt(flr))).map(flr => ({
			id: -1,
			first_name: flr,
		}));
		const realFillers = await context.Users.getUsers(fillers);
		return [...realFillers, ...customFillers];
	},
	fields(diagnose, _, ctx) {
		return safeParse(diagnose.fields, '{}');
	},
};
