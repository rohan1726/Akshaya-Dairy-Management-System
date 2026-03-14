import { Router } from 'express';
import paymentService from '../services/payment.service';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/types';
import { validate, paymentSchema } from '../utils/validation';
import { AuthRequest, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

router.use(authenticate);

// Calculate monthly payment
router.get('/calculate', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, message: 'Only admin can calculate payments' });
      return;
    }

    const { vendor_id, month } = req.query;
    if (!vendor_id || !month) {
      res.status(400).json({ success: false, message: 'vendor_id and month are required' });
      return;
    }

    const calculation = await paymentService.calculateMonthlyPayment(
      vendor_id as string,
      new Date(month as string)
    );

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error: any) {
    logger.error('Calculate payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate payment',
    });
  }
});

// Create payment
router.post('/', validate(paymentSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, message: 'Only admin can create payments' });
      return;
    }

    const payment = await paymentService.createPayment({
      ...req.body,
      created_by: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment,
    });
  } catch (error: any) {
    logger.error('Create payment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create payment',
    });
  }
});

// Get payments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const filters: any = {};

    // Role-based filtering
    if (req.user.role === UserRole.VENDOR) {
      const db = (await import('../config/database')).default;
      const center = await db('dairy_centers')
        .where('user_id', req.user.userId)
        .first();
      if (center) {
        filters.vendor_id = center.id;
      }
    } else if (req.query.vendor_id) {
      filters.vendor_id = req.query.vendor_id as string;
    }

    if (req.query.payment_month) {
      filters.payment_month = new Date(req.query.payment_month as string);
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }

    filters.limit = parseInt(req.query.limit as string) || 50;
    filters.offset = parseInt(req.query.offset as string) || 0;

    const payments = await paymentService.getPayments(filters);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    logger.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
  }
});

// Update payment status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, message: 'Only admin can update payment status' });
      return;
    }

    const { status, transaction_id, payment_method } = req.body;
    const payment = await paymentService.updatePaymentStatus(
      req.params.id,
      status,
      transaction_id,
      payment_method
    );

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment,
    });
  } catch (error: any) {
    logger.error('Update payment status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update payment status',
    });
  }
});

export default router;

