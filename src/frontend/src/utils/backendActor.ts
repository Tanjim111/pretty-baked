/**
 * backendActor.ts — Single source of truth for backend actor initialization.
 *
 * Uses @caffeineai/core-infrastructure's createActorWithConfig which:
 *   1. Fetches /env.json at runtime (populated by Caffeine platform with real canister ID + host)
 *   2. Creates an HttpAgent with the correct host for the deployment environment
 *   3. Only calls fetchRootKey() for localhost — never on mainnet
 *
 * This replaces the previous ad-hoc retry loop that bypassed the platform's
 * actor creation infrastructure and relied on build-time env vars that were
 * often unavailable at runtime.
 */

import { createActorWithConfig } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

// Cached actor promise — only one initialization runs at a time
let _actorPromise: Promise<backendInterface> | null = null;
let _sharedActor: backendInterface | null = null;

/**
 * Get backend actor — initializes on first call, caches for subsequent calls.
 * Uses the Caffeine platform's createActorWithConfig to resolve the canister
 * ID and host from /env.json (runtime) with fallback to CANISTER_ID_BACKEND (build-time).
 */
export async function getSharedActor(): Promise<backendInterface> {
  // Return cached actor immediately
  if (_sharedActor) return _sharedActor;

  // If initialization is already in progress, wait for the same promise
  if (_actorPromise) return _actorPromise;

  _actorPromise = createActorWithConfig(createActor)
    .then((actor) => {
      _sharedActor = actor as backendInterface;
      return _sharedActor;
    })
    .catch((err) => {
      // Reset on failure so the next call can retry
      _actorPromise = null;
      throw err;
    });

  return _actorPromise;
}

/**
 * Synchronous getter — returns the already-initialized actor or null.
 * Only use for optional/best-effort calls (e.g. logout, chat fallback).
 * Do NOT use this for critical operations — use getSharedActor() instead.
 */
export function getSharedActorSync(): backendInterface | null {
  return _sharedActor;
}

/**
 * Reset the cached actor — forces a fresh initialization on next call.
 * Use sparingly (e.g. after a network error recovery).
 */
export function resetSharedActor(): void {
  _sharedActor = null;
  _actorPromise = null;
}

// Kick off actor initialization immediately on module load so it's ready
// by the time the user clicks Register / Add Category.
getSharedActor().catch(() => {
  // Silently ignore startup errors — getSharedActor() will retry on demand
});
