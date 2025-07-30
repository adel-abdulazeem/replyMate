import express from 'express';
import { DashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/messages', DashboardController.getMessages);
router.post('/messages/:id/approve', DashboardController.approveMessage);
router.post('/messages/:id/reject', DashboardController.rejectMessage);
router.post('/messages/:id/edit', DashboardController.editMessage);

export { router as dashboardRouter };