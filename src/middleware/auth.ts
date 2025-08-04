import { Request, Response, NextFunction } from 'express';
import JWT from '../lib/jwt.js';

const AUTH = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.token as string | undefined;

		if (!token) {
			res.status(401).json({
				status: 401,
				message: 'Unauthorized',
			});
			return;
		}

		const userStatus = new JWT(token).verify();

		if (!userStatus) {
			res.status(401).json({
				status: 401,
				message: 'Unauthorized',
			});
			return;
		}

		next();
	} catch (error) {
		res.status(401).json({
			status: 401,
			message: 'Unauthorized',
		});
	}
};

export default AUTH;
