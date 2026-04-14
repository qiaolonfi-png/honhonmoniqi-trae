import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface JWTPayload {
	userId: number;
	username: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
	return await new SignJWT({ userId: payload.userId, username: payload.username })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('7d')
		.setIssuedAt()
		.sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return {
			userId: payload.userId as number,
			username: payload.username as string,
		};
	} catch (error) {
		return null;
	}
}
