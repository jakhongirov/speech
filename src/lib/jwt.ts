import { sign, verify, JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY as string;

class JWT<T extends object | string> {
	private data: T;

	constructor(data: T) {
		this.data = data;
	}

	sign(): string {
		if (!SECRET_KEY) {
			throw new Error('SECRET_KEY is not defined in environment variables');
		}
		return sign(this.data, SECRET_KEY);
	}

	verify(): JwtPayload | string {
		if (!SECRET_KEY) {
			throw new Error('SECRET_KEY is not defined in environment variables');
		}
		return verify(this.data as string, SECRET_KEY) as JwtPayload;;
	}
}

export default JWT;
