// src/routes/loanRoutes.ts
import { Router } from 'express';
import { checkEligibility, applyForLoan, uploadFile, getMyLoans } from '../controllers/loanController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSalarySlip } from '../middleware/upload.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { UserRole } from '../models/User.js';

const router = Router();
router.use(authenticateToken);

router.post('/check-bre', checkEligibility);
router.post('/upload', uploadSalarySlip.single('salarySlip'), uploadFile);
router.get('/my', authorizeRoles(UserRole.BORROWER), getMyLoans);
router.post('/apply', authorizeRoles(UserRole.BORROWER), applyForLoan);

export default router;
