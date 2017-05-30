import { app as settings } from '../../../package.json'
import jwt from 'jsonwebtoken';
import User from '../sql/users';
import Clinic from '../sql/clinics';
import log from '../../log'

function generateToken(req, user) {
	const token = jwt.sign({
		user,
		agent: req.headers['user-agent'],
		exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60 // Note: in seconds!
	}, settings.secret);
	return token;
}

const user = new User();

export default (req, res, next) => {
	user.checkPassword(req.body).then(async isValid => {
		if (isValid) {
			try {
				const { id, role, clinic_id, disabled, clinic } = await user.getByLogin(req.body.login);
				if (disabled || (clinic_id && role === 'THERAPIST' && clinic.disabled)) {
					next(res.status(401).json({
						error: 'USER_DISABLED',
					}));
				} else {
					const token = generateToken(req, { id });
					next(res.json({
						token,
						currentUser: {
							id,
							role,
							clinic_id,
							clinic,
						},
					}));
				}
			} catch (e) {
				res.status(400);
			}
		} else {
			next(res.status(400).json(
				{
					error: 'WRONG_PASSWORD',
				},
			));
		}
	})
		.catch(e => log.error(e));
}