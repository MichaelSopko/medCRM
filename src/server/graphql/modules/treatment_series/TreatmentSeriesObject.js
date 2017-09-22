export default {
	__resolveType(obj, context, info){
		if((obj.therapist_ids !== undefined || obj.therapists !== undefined) && !obj.start_date){
			return 'SchoolObservation';
		}
		if(obj.participant_ids !== undefined || obj.participants !== undefined){
			return 'StaffMeeting';
		}
		if(obj.consultantRole !== undefined){
			return 'OutsideSourceConsult';
		}
		if(obj.start_date !== undefined){
			return 'Treatment';
		}
		console.log(obj);
		throw Error('cant resolve object type');
	},
}
