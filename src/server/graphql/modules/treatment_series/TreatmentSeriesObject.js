export default {
	__resolveType(obj, context, info){
		if(obj.observationReason !== undefined){
			return 'SchoolObservation';
		}
		if(obj.protocol !== undefined){
			return 'StaffMeeting';
		}
		if(obj.consultantRole !== undefined){
			return 'OutsideSourceConsult';
		}
		if(obj.start_date !== undefined){
			return 'Treatment';
		}
		return 'Treatment';
	},
}
