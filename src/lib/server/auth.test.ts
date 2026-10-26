import { describe, it, expect } from 'vitest';
import { isTrustedProxy, parseAuthHeaders, isAllowed } from './auth';

describe('isTrustedProxy', () => {
	it('matches exact IPv4', () => {
		expect(isTrustedProxy('10.0.0.5', ['10.0.0.5'])).toBe(true);
		expect(isTrustedProxy('10.0.0.6', ['10.0.0.5'])).toBe(false);
	});

	it('matches IPv4 CIDR ranges', () => {
		expect(isTrustedProxy('172.18.0.9', ['172.18.0.0/16'])).toBe(true);
		expect(isTrustedProxy('172.19.0.9', ['172.18.0.0/16'])).toBe(false);
	});

	it('normalises IPv4-mapped IPv6 addresses', () => {
		expect(isTrustedProxy('::ffff:172.18.0.2', ['172.18.0.0/16'])).toBe(true);
	});

	it('rejects malformed entries instead of matching', () => {
		expect(isTrustedProxy('10.0.0.5', ['not-an-ip'])).toBe(false);
		expect(isTrustedProxy('10.0.0.5', ['10.0.0.0/99'])).toBe(false);
		expect(isTrustedProxy('10.0.0.5', [''])).toBe(false);
	});
});

describe('parseAuthHeaders', () => {
	const headers = (map: Record<string, string>) => (name: string) => map[name] ?? null;

	it('extracts identity from Authelia headers', () => {
		const auth = parseAuthHeaders(
			headers({
				'remote-user': 'andrew',
				'remote-email': 'a@example.com',
				'remote-name': 'Andrew',
				'remote-groups': 'levelup-users, admins'
			})
		);
		expect(auth).toEqual({
			username: 'andrew',
			email: 'a@example.com',
			displayName: 'Andrew',
			groups: ['levelup-users', 'admins']
		});
	});

	it('returns null without a username', () => {
		expect(parseAuthHeaders(headers({}))).toBeNull();
		expect(parseAuthHeaders(headers({ 'remote-user': '  ' }))).toBeNull();
	});
});

describe('isAllowed', () => {
	it('lets everyone in when no group is configured', () => {
		expect(isAllowed([], '')).toBe(true);
	});

	it('requires the configured group otherwise', () => {
		expect(isAllowed(['levelup-users'], 'levelup-users')).toBe(true);
		expect(isAllowed(['admins'], 'levelup-users')).toBe(false);
	});
});
