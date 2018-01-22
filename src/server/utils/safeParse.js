export default (json, deflt = []) => {
	try {
		return JSON.parse(json || `${deflt}`)
	} catch (e) {
		console.error('JSON parse error');
		return deflt;
	}
};
