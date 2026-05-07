import { Router } from 'express';
import { getQueueSummary, getRecentFailedJobs } from '../controllers/queue.controller';
import { authMiddleware, authorizeRole } from '../middlewares/auth.middleware';

const queueRouter = Router();

queueRouter.use(authMiddleware, authorizeRole(['SUPER_ADMIN']));

queueRouter.get('/notifications/summary', getQueueSummary);
queueRouter.get('/notifications/failed', getRecentFailedJobs);

export default queueRouter;
