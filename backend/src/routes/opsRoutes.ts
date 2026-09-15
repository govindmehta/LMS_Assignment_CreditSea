// src/routes/opsRoutes.ts
import { Router } from 'express';
import {
  getSalesLeads,
  getSanctionLoans,
  reviewSanction,
  getDisbursementLoans,
  disburseLoan,
  getCollectionLoans,
  recordPayment,
} from '../controllers/opsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { UserRole } from '../models/User.js';

const router = Router();
router.use(authenticateToken);

router.get('/sales', authorizeRoles(UserRole.SALES), getSalesLeads);
router.get('/sanction', authorizeRoles(UserRole.SANCTION), getSanctionLoans);
router.post('/sanction/:loanId', authorizeRoles(UserRole.SANCTION), reviewSanction);
router.get('/disbursement', authorizeRoles(UserRole.DISBURSEMENT), getDisbursementLoans);
router.post('/disbursement/:loanId', authorizeRoles(UserRole.DISBURSEMENT), disburseLoan);
router.get('/collection', authorizeRoles(UserRole.COLLECTION), getCollectionLoans);
router.post('/collection/:loanId', authorizeRoles(UserRole.COLLECTION), recordPayment);

export default router;