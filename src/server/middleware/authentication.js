import { app as settings } from '../../../package.json'
import jwt from 'jsonwebtoken';
import User from '../sql/users';
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
			const { id } = await user.getUser({ login: req.body.login });
			const token = generateToken(req, { id });
			next(res.json({
				token
			}));
		} else {
			next(res.status(400).json(
				{
					error: 'Invalid user data'
				}
			));
		}
	})
		.catch(e => log.error(e));
}