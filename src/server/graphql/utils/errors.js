import { createError } from 'apollo-errors';

export const UnauthenticatedError = createError('UNAUTHENTICATED_ERROR', {
	message: 'You must be authenticated to perform this request',
});

export const UnauthorizedError = createError('UNAUTHORIZED_ERROR', {
	message: 'You have not enough rights to perform this request',
});

export const DuplicateEmailError = createError('DUPLICATE_EMAIL_ERROR', {
	message: 'User with same email already exists',
});

export const InvalidUserCredentialsError = createError('INVALID_USER_CREDENTIALS_ERROR', {
	message: 'User with same email or password does not exist',
});

export const InvalidArgumentsError = createError('INVALID_ARGUMENTS_ERROR', {
	message: 'You have passed invalid arguments to mutation',
});

export const UploadFileError = createError('UPLOAD_FILE_ERROR', {
	message: 'Unable to process one of the files that you have uploaded',
});
