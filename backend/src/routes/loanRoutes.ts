// src/routes/loanRoutes.ts
import { Router } from 'express';
import { checkEligibility, applyForLoan, uploadFile } from '../controllers/loanController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSalarySlip } from '../middleware/upload.js';

const router = Router();
router.use(authenticateToken);

router.post('/check-bre', checkEligibility);
router.post('/upload', uploadSalarySlip.single('salarySlip'), uploadFile);
router.post('/apply', applyForLoan);

export default router;