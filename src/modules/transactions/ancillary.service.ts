import { NotFoundError } from '../../core/errors/AppError';
import {
  TermsAndConditionsRepository,
  TransportationDetailsRepository,
} from './ancillary.repository';
import { TermsAndConditionsInput, TransportationDetailsInput } from './ancillary.schema';

const tncRepo = new TermsAndConditionsRepository();
const transportRepo = new TransportationDetailsRepository();

export const TermsAndConditionsService = {
  async list(options?: { page?: number; limit?: number }) {
    return tncRepo.findMany(options ?? {});
  },

  async get(id: number) {
    const record = await tncRepo.findById(id);
    if (!record) throw new NotFoundError('Terms and Conditions record not found');
    return record;
  },

  async create(data: TermsAndConditionsInput, user?: string) {
    return tncRepo.create(data, { user });
  },

  async update(id: number, data: Partial<TermsAndConditionsInput>, user?: string) {
    const existing = await tncRepo.findById(id);
    if (!existing) throw new NotFoundError('Terms and Conditions record not found');
    return tncRepo.update(id, data, { user });
  },

  async delete(id: number, user?: string) {
    const existing = await tncRepo.findById(id);
    if (!existing) throw new NotFoundError('Terms and Conditions record not found');
    return tncRepo.delete(id, { user, hardDelete: true });
  },
};

export const TransportationService = {
  async list(options?: { page?: number; limit?: number }) {
    return transportRepo.findMany(options ?? {});
  },

  async get(id: number) {
    const record = await transportRepo.findById(id);
    if (!record) throw new NotFoundError('Transportation details record not found');
    return record;
  },

  async create(data: TransportationDetailsInput, user?: string) {
    return transportRepo.create(data, { user });
  },

  async update(id: number, data: Partial<TransportationDetailsInput>, user?: string) {
    const existing = await transportRepo.findById(id);
    if (!existing) throw new NotFoundError('Transportation details record not found');
    return transportRepo.update(id, data, { user });
  },

  async delete(id: number, user?: string) {
    const existing = await transportRepo.findById(id);
    if (!existing) throw new NotFoundError('Transportation details record not found');
    return transportRepo.delete(id, { user, hardDelete: true });
  },
};
