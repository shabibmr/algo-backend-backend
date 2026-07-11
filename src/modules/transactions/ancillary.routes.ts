import { Router } from 'express';
import { AncillaryController } from './ancillary.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import { termsAndConditionsSchema, transportationDetailsSchema } from './ancillary.schema';

const router = Router();

router.use(authenticate);

// ── Terms & Conditions ────────────────────────────────────────────────────────
router.get(
  '/terms-and-conditions',
  authorize('TermsAndConditions', 'read'),
  AncillaryController.listTermsAndConditions,
);

router.get(
  '/terms-and-conditions/:id',
  authorize('TermsAndConditions', 'read'),
  AncillaryController.getTermsAndConditions,
);

router.post(
  '/terms-and-conditions',
  authorize('TermsAndConditions', 'create'),
  validate(termsAndConditionsSchema),
  AncillaryController.createTermsAndConditions,
);

router.put(
  '/terms-and-conditions/:id',
  authorize('TermsAndConditions', 'update'),
  validate(termsAndConditionsSchema),
  AncillaryController.updateTermsAndConditions,
);

router.delete(
  '/terms-and-conditions/:id',
  authorize('TermsAndConditions', 'delete'),
  AncillaryController.deleteTermsAndConditions,
);

// ── Transportation Details ────────────────────────────────────────────────────
router.get(
  '/transportation-details',
  authorize('TransportationDetails', 'read'),
  AncillaryController.listTransportationDetails,
);

router.get(
  '/transportation-details/:id',
  authorize('TransportationDetails', 'read'),
  AncillaryController.getTransportationDetails,
);

router.post(
  '/transportation-details',
  authorize('TransportationDetails', 'create'),
  validate(transportationDetailsSchema),
  AncillaryController.createTransportationDetails,
);

router.put(
  '/transportation-details/:id',
  authorize('TransportationDetails', 'update'),
  validate(transportationDetailsSchema),
  AncillaryController.updateTransportationDetails,
);

router.delete(
  '/transportation-details/:id',
  authorize('TransportationDetails', 'delete'),
  AncillaryController.deleteTransportationDetails,
);

export const ancillaryRoutes = router;
export default router;
