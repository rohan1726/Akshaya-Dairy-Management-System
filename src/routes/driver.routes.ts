import { Router } from 'express';
import driverController from '../controllers/driver.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, driverLocationSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.patch('/duty-status', driverController.updateDutyStatus.bind(driverController));
router.post('/location', validate(driverLocationSchema), driverController.saveLocation.bind(driverController));
router.get('/location/current', driverController.getCurrentLocation.bind(driverController));
router.get('/location/history', driverController.getLocationHistory.bind(driverController));
router.get('/centers', driverController.getAssignedCenters.bind(driverController));
router.get('/all', driverController.getAllDrivers.bind(driverController));

export default router;

