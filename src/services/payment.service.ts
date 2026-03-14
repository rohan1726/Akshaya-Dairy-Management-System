import db from '../config/database';
import { Payment, PaymentType, PaymentStatus } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export class PaymentService {
  async calculateMonthlyPayment(
    vendorId: string,
    month: Date
  ): Promise<{
    totalMilkAmount: number;
    advanceAmount: number;
    previousPending: number;
    deductions: number;
    finalAmount: number;
  }> {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const monthStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    // Calculate total milk collection amount for the month
    const milkCollections = await db('milk_collections')
      .where('vendor_id', vendorId)
      .whereBetween('collection_date', [monthStr, monthEndStr])
      .where('status', '!=', 'rejected')
      .sum('total_amount as total')
      .first();

    const totalMilkAmount = parseFloat(milkCollections?.total || '0');

    // Get advance payments
    const advances = await db('payments')
      .where('vendor_id', vendorId)
      .where('payment_type', PaymentType.ADVANCE)
      .where('status', PaymentStatus.PAID)
      .sum('advance_amount as total')
      .first();

    const advanceAmount = parseFloat(advances?.total || '0');

    // Get previous month pending
    const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const previousMonthStr = previousMonth.toISOString().split('T')[0];
    
    const previousPayments = await db('payments')
      .where('vendor_id', vendorId)
      .where('payment_month', previousMonthStr)
      .where('status', PaymentStatus.PENDING)
      .sum('final_amount as total')
      .first();

    const previousPending = parseFloat(previousPayments?.total || '0');

    // Deductions (can be extended)
    const deductions = 0;

    // Final amount
    const finalAmount = totalMilkAmount - advanceAmount - deductions + previousPending;

    return {
      totalMilkAmount,
      advanceAmount,
      previousPending,
      deductions,
      finalAmount,
    };
  }

  async createPayment(paymentData: {
    vendor_id: string;
    payment_type: PaymentType;
    payment_month?: Date;
    total_amount: number;
    advance_amount?: number;
    previous_pending?: number;
    deductions?: number;
    final_amount: number;
    payment_notes?: string;
    created_by: string;
  }): Promise<Payment> {
    const monthStr = paymentData.payment_month
      ? new Date(paymentData.payment_month).toISOString().split('T')[0].substring(0, 7) + '-01'
      : null;

    const paymentCode = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;

    const [payment] = await db('payments')
      .insert({
        ...paymentData,
        payment_code: paymentCode,
        payment_month: monthStr,
        advance_amount: paymentData.advance_amount || 0,
        previous_pending: paymentData.previous_pending || 0,
        deductions: paymentData.deductions || 0,
        status: PaymentStatus.PENDING,
      })
      .returning('*');

    // Create notification
    await db('notifications').insert({
      user_id: paymentData.vendor_id,
      user_role: 'vendor',
      title: 'Payment Generated',
      message: `Monthly payment of ₹${paymentData.final_amount} has been generated.`,
      type: 'payment_released',
      priority: 'high',
      is_read: false,
      metadata: { payment_id: payment.id },
    });

    return payment;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string,
    paymentMethod?: string
  ): Promise<Payment> {
    const updateData: any = {
      status,
      modified_at: new Date(),
    };

    if (status === PaymentStatus.PAID) {
      updateData.paid_at = new Date();
      updateData.transaction_id = transactionId;
      updateData.payment_method = paymentMethod;
    }

    const [payment] = await db('payments')
      .where('id', paymentId)
      .update(updateData)
      .returning('*');

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  async getPayments(filters: {
    vendor_id?: string;
    payment_month?: Date;
    status?: PaymentStatus;
    limit?: number;
    offset?: number;
  }): Promise<Payment[]> {
    let query = db('payments').select('*');

    if (filters.vendor_id) {
      query = query.where('vendor_id', filters.vendor_id);
    }
    if (filters.payment_month) {
      const monthStr = new Date(filters.payment_month).toISOString().split('T')[0].substring(0, 7) + '-01';
      query = query.where('payment_month', monthStr);
    }
    if (filters.status) {
      query = query.where('status', filters.status);
    }

    query = query.orderBy('created_at', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }
}

export default new PaymentService();

