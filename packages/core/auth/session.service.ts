import crypto from 'crypto'
import { db } from '../database/knex'

// Max absolute session age (default 8h)
const MAX_AGE_MS = parseInt(process.env.SESSION_MAX_AGE_MS || String(8 * 60 * 60 * 1000))
// Idle timeout — session is invalid if last_seen is older than this (default 1h)
const IDLE_TIMEOUT_MS = parseInt(process.env.SESSION_IDLE_MS || String(60 * 60 * 1000))
// Throttle window for updating last_seen (1 min)
const TOUCH_THROTTLE_MS = 60_000

export function hashSessionToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
}

function generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

/**
 * Returns the current active+valid session for the user, or null if none.
 */
export async function getActiveSession(userId: number) {
    const now = new Date()
    const idleThreshold = new Date(Date.now() - IDLE_TIMEOUT_MS)

    return db('sessions')
        .where({ user_id: userId, is_active: 1 })
        .where('expires_at', '>', now)
        .where('last_seen', '>', idleThreshold)
        .first()
}

/**
 * Creates a new session for the user. Returns the raw token (to embed in JWT)
 * and its hash (stored in DB).
 */
export async function createSession(
    userId: number,
    ip?: string,
    userAgent?: string
): Promise<{ token: string; tokenHash: string }> {
    const token = generateToken()
    const tokenHash = hashSessionToken(token)
    const id = crypto.randomBytes(16)
    const expiresAt = new Date(Date.now() + MAX_AGE_MS)

    await db('sessions').insert({
        id,
        user_id: userId,
        token_hash: tokenHash,
        ip: ip ?? null,
        user_agent: userAgent ?? null,
        is_active: 1,
        expires_at: expiresAt,
    })

    return { token, tokenHash }
}

/**
 * Validates a session by raw token. If valid, updates last_seen (throttled).
 * Returns true if valid, false otherwise.
 */
export async function validateAndTouchSession(token: string): Promise<boolean> {
    const tokenHash = hashSessionToken(token)
    const now = new Date()
    const idleThreshold = new Date(Date.now() - IDLE_TIMEOUT_MS)

    const session = await db('sessions')
        .where({ token_hash: tokenHash, is_active: 1 })
        .where('expires_at', '>', now)
        .where('last_seen', '>', idleThreshold)
        .first()

    if (!session) return false

    // Throttle: only update last_seen if last touch was > TOUCH_THROTTLE_MS ago
    const lastSeen = new Date(session.last_seen).getTime()
    if (Date.now() - lastSeen > TOUCH_THROTTLE_MS) {
        await db('sessions')
            .where({ token_hash: tokenHash })
            .update({ last_seen: now })
    }

    return true
}

/**
 * Marks a specific session as inactive.
 */
export async function invalidateSession(token: string): Promise<void> {
    const tokenHash = hashSessionToken(token)
    await db('sessions').where({ token_hash: tokenHash }).update({ is_active: 0 })
}

/**
 * Marks ALL sessions of a user as inactive (useful for admin revocation).
 */
export async function invalidateAllUserSessions(userId: number): Promise<void> {
    await db('sessions').where({ user_id: userId }).update({ is_active: 0 })
}

