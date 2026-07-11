/**
 * Task 71: Outbound webhook dispatcher stub.
 *
 * Usage in services:
 *   webhookDispatcher.emit('invoice.posted', { id: 123, ... });
 *
 * Wire up real subscribers via registerSubscriber() at startup.
 * The default implementation just logs events — swap in HTTP delivery later.
 */
import { logger } from '../utils/logger';

type WebhookEvent = {
  event: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

type WebhookSubscriber = (event: WebhookEvent) => Promise<void>;

const subscribers: Map<string, WebhookSubscriber[]> = new Map();

export const webhookDispatcher = {
  registerSubscriber(eventPattern: string, fn: WebhookSubscriber) {
    if (!subscribers.has(eventPattern)) subscribers.set(eventPattern, []);
    subscribers.get(eventPattern)!.push(fn);
  },

  async emit(event: string, payload: Record<string, unknown>) {
    const envelope: WebhookEvent = {
      event,
      payload,
      timestamp: new Date().toISOString(),
    };

    // Find all matching subscribers (exact match or wildcard prefix 'module.*')
    const handlers: WebhookSubscriber[] = [];
    for (const [pattern, fns] of subscribers) {
      if (pattern === event) {
        handlers.push(...fns);
      } else if (pattern.endsWith('.*') && event.startsWith(pattern.slice(0, -2))) {
        handlers.push(...fns);
      }
    }

    if (handlers.length === 0) {
      logger.debug({ message: 'webhook.emit (no subscribers)', event });
      return;
    }

    await Promise.allSettled(
      handlers.map((fn) =>
        fn(envelope).catch((err) =>
          logger.error({ message: 'webhook subscriber error', event, error: err.message }),
        ),
      ),
    );
  },
};

export default webhookDispatcher;
