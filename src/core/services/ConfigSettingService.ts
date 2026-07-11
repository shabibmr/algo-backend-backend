import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

const cache: Record<string, CacheEntry> = {};
const DEFAULT_TTL_MS = 60000; // 60 seconds

function castValue(value: string | null, dataType: string | null): any {
  if (value === null || value === undefined) {
    return null;
  }

  const dt = dataType?.toLowerCase();

  switch (dt) {
    case 'integer': {
      const val = parseInt(value, 10);
      return isNaN(val) ? null : val;
    }
    case 'float': {
      const val = parseFloat(value);
      return isNaN(val) ? null : val;
    }
    case 'boolean':
      return (
        value.toLowerCase() === '1' ||
        value.toLowerCase() === 'true' ||
        value.toLowerCase() === 'yes'
      );
    case 'json':
      try {
        return JSON.parse(value);
      } catch (err) {
        logger.error({ message: `Failed to parse JSON config value for: ${value}`, error: err });
        return null;
      }
    case 'date':
      return new Date(value);
    case 'string':
    default:
      return value;
  }
}

export const ConfigSettingService = {
  /**
   * Get configuration setting, parsed according to its Data_Type, with a short TTL cache.
   */
  async get(key: string, defaultValue: any = null, ttlMs = DEFAULT_TTL_MS): Promise<any> {
    const now = Date.now();
    const cached = cache[key];

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    try {
      const record = await prisma.config_settings.findUnique({
        where: { gm_key: key },
      });

      if (!record) {
        return defaultValue;
      }

      const parsedValue = castValue(record.gm_value, record.Data_Type);

      // Update Cache
      cache[key] = {
        value: parsedValue,
        expiresAt: now + ttlMs,
      };

      return parsedValue;
    } catch (err: any) {
      logger.error({ message: `Error reading config setting: ${key}`, error: err.message });
      return defaultValue;
    }
  },

  /**
   * Clear cache for a key or all keys
   */
  clearCache(key?: string) {
    if (key) {
      delete cache[key];
    } else {
      for (const k in cache) {
        delete cache[k];
      }
    }
  },

  // Helper shortcuts
  async getVatRate(): Promise<number> {
    return this.get('VAT_RATE', 5.0); // 5% default
  },

  async getMaxDiscountPercent(): Promise<number> {
    return this.get('MAX_DISCOUNT_PERCENT', 100.0); // 100% default (no limit)
  },

  async getEnableBatchTracking(): Promise<boolean> {
    return this.get('ENABLE_BATCH_TRACKING', false);
  },

  async getFinancialYear(): Promise<string | null> {
    return this.get('FINANCIAL_YEAR', null);
  },
};

export default ConfigSettingService;
