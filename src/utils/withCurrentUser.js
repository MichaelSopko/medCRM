import { connect } from 'react-redux';

export default connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser }));