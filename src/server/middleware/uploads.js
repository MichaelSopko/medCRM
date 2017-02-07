import { app as settings } from '../../../package.json'
import jwt from 'jsonwebtoken';
import upload from 'jquery-file-upload-middleware';


export default (req, res, next) => {
	const { user } = req.user;

	if (!user) return res.sendStatus(401);

	const timestamp = new Date().getTime();

	upload.fileHandler({
		uploadDir: function () {
			return `${settings.uploadsDir}/${timestamp}`
		},
		uploadUrl: function () {
			return `/uploads/${timestamp}`
		}
	})(req, res, next);

}