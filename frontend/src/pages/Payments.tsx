import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Badge, Spinner } from 'react-bootstrap';

interface Payment {
  id: string;
  payment_code: string;
  payment_type: string;
  final_amount: number;
  status: string;
  payment_month: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/payment');
      setPayments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div>
      <h2 className="mb-4 fw-bold" style={{ color: '#6F42C1' }}>Payments</h2>
      <div className="card border-0 shadow-sm">
        <div 
          className="card-header text-white border-0"
          style={{ 
            backgroundColor: '#6F42C1',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <h5 className="mb-0 fw-semibold">Payment History</h5>
        </div>
        <div className="card-body p-0">
          <Table striped hover className="mb-0">
            <thead>
              <tr>
                <th style={{ backgroundColor: '#6F42C1', color: 'white' }}>Payment Code</th>
                <th style={{ backgroundColor: '#6F42C1', color: 'white' }}>Type</th>
                <th style={{ backgroundColor: '#6F42C1', color: 'white' }}>Month</th>
                <th style={{ backgroundColor: '#6F42C1', color: 'white' }}>Amount</th>
                <th style={{ backgroundColor: '#6F42C1', color: 'white' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="fw-semibold">{payment.payment_code}</td>
                    <td>{payment.payment_type}</td>
                    <td>{payment.payment_month ? new Date(payment.payment_month).toLocaleDateString() : 'N/A'}</td>
                    <td className="fw-semibold" style={{ color: '#6F42C1' }}>
                      ₹{payment.final_amount.toFixed(2)}
                    </td>
                    <td>
                      <Badge 
                        style={{
                          backgroundColor: payment.status === 'paid' ? '#00CCCC' : '#FFC107',
                          color: payment.status === 'paid' ? 'white' : '#212529',
                          padding: '6px 12px',
                          borderRadius: '6px'
                        }}
                      >
                        {payment.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-5 text-muted">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Payments;

