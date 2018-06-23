import upload from 'jquery-file-upload-middleware';
import { app as settings } from '../../../package.json';

export default (req, res, next) => {
	const { user } = req.user;

	if (!user) return res.sendStatus(401);

	const timestamp = new Date().getTime();

	upload.fileHandler({
		uploadDir: () => `${settings.uploadsDir}/${timestamp}`,
		uploadUrl: () => `/uploads/${timestamp}`,
	})(req, res, next);
};
