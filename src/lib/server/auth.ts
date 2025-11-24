import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import type { Session, User } from '@prisma/client';
import { prisma } from '$lib/db/prisma';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAt = new Date(Date.now() + DAY_IN_MS * 30);

	const session = await prisma.session.create({
		data: {
			id: sessionId,
			userId,
			expiresAt
		}
	});

	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		include: { user: true }
	});

	if (!session) {
		return { session: null, user: null };
	}
	const safeUser: SessionUser = {
		id: session.user.id,
		email: session.user.email,
		fullName: session.user.fullName
	};

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await prisma.session.delete({ where: { id: session.id } });
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		const refreshedExpiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		const refreshed = await prisma.session.update({
			where: { id: session.id },
			data: { expiresAt: refreshedExpiresAt },
			include: { user: true }
		});

		return {
			session: refreshed,
			user: {
				id: refreshed.user.id,
				email: refreshed.user.email,
				fullName: refreshed.user.fullName
			}
		};
	}

	return { session, user: safeUser };
}

type SessionUser = Pick<User, 'id' | 'email' | 'fullName'>;
type SessionResult = { session: Session | null; user: SessionUser | null };
export type SessionValidationResult = SessionResult;

export async function invalidateSession(sessionId: string) {
	await prisma.session.delete({ where: { id: sessionId } });
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
