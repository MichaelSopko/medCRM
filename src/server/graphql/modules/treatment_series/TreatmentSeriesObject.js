export default {
	__resolveType(obj, context, info){
		if(obj.observationReason){
			return 'SchoolObservation';
		}
		if(obj.protocol){
			return 'StaffMeeting';
		}
		if(obj.consultantRole){
			return 'OutsideSourceConsult';
		}
		if(obj.next_treatment_remark){
			return 'Treatment';
		}
		return null;
	},
}
