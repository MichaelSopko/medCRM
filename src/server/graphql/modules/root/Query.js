export default {
	currentUser(ignored1, ignored2, context) {
		return context.Users.findOne(context.currentUser.id);
	},
};
