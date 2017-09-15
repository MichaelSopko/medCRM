export default {
	async addPatient(_, { clinic_id, patient }, context) {
		await checkAccess(context, ROLES.THERAPIST);
		const { Users, Clinics } = context;
		const { patients_limit } = await Clinics.findOne(clinic_id);
		const patients = await Users.findByRole(ROLES.PATIENT, clinic_id);
		if (patients.length >= +patients_limit) {
			throw new Error(JSON.stringify({ code: 'PATIENTS_LIMIT', payload: patients_limit }));
		}

		try {
			const [id] = await Users.createUser({
				clinic_id,
				...patient,
				role: ROLES.PATIENT,
			});
			patient = await Users.findOne(id);
			pubsub.publish('patientCreated', patient);
			return patient;
		} catch (e) {
			checkForNonUniqueField(e);
		}
	},
	editPatient(_, { id, patient }, context) {
		return checkAccess(context, ROLES.THERAPIST)
			.then(() => context.Users.editUser({
				id,
				...patient
			}))
			.then(() => context.Users.findOne(id))
			.then(patient => {
				pubsub.publish('patientUpdated', patient);
				return patient;
			})
			.catch(checkForNonUniqueField)
	},
	deletePatient(_, { id }, context) {
		return checkAccess(context, ROLES.THERAPIST)
			.then(() => context.Users.findOne(id))
			.then(async patient => {
				const res = await context.Users.deleteUser({ id });
				if (res) {
					pubsub.publish('patientDeleted', patient);
					return patient;
				}
			})
			.then(res => ({ status: res }))
	},
	async unarchivePatient(_, { id }, context) {
		const currentUser = await checkAccess(context, ROLES.THERAPIST);
		const isAdmin = currentUser.role === ROLES.SYSTEM_ADMIN;
		const { Users, Clinics } = context;
		const { clinic_id, archived_date } = await Users.findOne(id);
		const { patients_limit, archive_time } = await Clinics.findOne(clinic_id);
		const patients = await Users.findByRole(ROLES.PATIENT, clinic_id);
		if (!isAdmin && patients.length >= +patients_limit) {
			throw new Error(JSON.stringify({ code: 'PATIENTS_LIMIT', payload: patients_limit }));
		}
		if (!isAdmin && archive_time && moment(archived_date).diff(moment(), 'minutes') < archive_time) {
			throw new Error(JSON.stringify({ code: 'TIME_LIMIT', payload: archive_time }));
		}
		await Users.editUser({ id, archived: false });
		return Users.findOne(id);
	},
	async archivePatient(_, { id }, context) {
		await checkAccess(context, ROLES.THERAPIST);
		const { Users, Clinics } = context;

		await Users.editUser({ id, archived: true, archived_date: moment().format('YYYY-MM-DD HH:mm:ss') });
		return Users.findOne(id);
	},
};
