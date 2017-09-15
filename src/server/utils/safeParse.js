export default (json, deflt = []) => {
	try {
		return JSON.parse(json || `${deflt}`)
	} catch (e) {
		log('JSON parse error');
		return deflt;
	}
};
