import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const MilkCollection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState<any[]>([]);
  const [todayPrice, setTodayPrice] = useState<any>(null);
  const [formData, setFormData] = useState({
    // vendor_id: '', // Commented out - using center_id only
    center_id: '',
    collection_date: new Date().toISOString().split('T')[0],
    collection_time: 'morning',
    milk_type: 'mix_milk',
    milk_weight: '',
    fat_percentage: '',
    snf_percentage: '',
    can_number: '',
  });

  useEffect(() => {
    if (user?.role === 'driver') {
      fetchAssignedCenters();
    }
  }, [user]);

  useEffect(() => {
    if (formData.center_id && formData.milk_type) {
      fetchTodayPrice();
    }
  }, [formData.center_id, formData.milk_type]);

  const fetchAssignedCenters = async () => {
    try {
      const response = await axios.get('/driver/centers');
      setCenters(response.data.data);
      if (response.data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          // vendor_id: response.data.data[0].id, // Commented out - using center_id only
          center_id: response.data.data[0].id,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch centers:', error);
    }
  };

  const fetchTodayPrice = async () => {
    try {
      // Fetch price for selected center, or use first center if available
      const centerId = formData.center_id || (centers.length > 0 ? centers[0].id : '');
      if (centerId) {
        const response = await axios.get(`/milk/price/today?center_id=${centerId}&milk_type=${formData.milk_type}`);
        setTodayPrice(response.data.data);
      } else {
        // Fallback to global price
        const response = await axios.get(`/milk/price/today?milk_type=${formData.milk_type}`);
        setTodayPrice(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
      setTodayPrice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.center_id) {
      toast.error('Please select a dairy center');
      return;
    }
    if (!formData.milk_weight || parseFloat(formData.milk_weight) <= 0) {
      toast.error('Please enter a valid milk weight');
      return;
    }
    if (!formData.fat_percentage || parseFloat(formData.fat_percentage) < 0 || parseFloat(formData.fat_percentage) > 100) {
      toast.error('Please enter a valid FAT percentage (0-100)');
      return;
    }
    if (!formData.snf_percentage || parseFloat(formData.snf_percentage) < 0 || parseFloat(formData.snf_percentage) > 100) {
      toast.error('Please enter a valid SNF percentage (0-100)');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/milk/collections', {
        // vendor_id: formData.vendor_id, // Commented out - using center_id only
        center_id: formData.center_id,
        collection_date: formData.collection_date,
        collection_time: formData.collection_time,
        milk_type: formData.milk_type,
        milk_weight: parseFloat(formData.milk_weight),
        fat_percentage: parseFloat(formData.fat_percentage),
        snf_percentage: parseFloat(formData.snf_percentage),
        can_number: formData.can_number,
      });
      toast.success('Milk collection recorded successfully!');
      setFormData({
        // vendor_id: formData.vendor_id, // Commented out - using center_id only
        center_id: formData.center_id,
        collection_date: new Date().toISOString().split('T')[0],
        collection_time: 'morning',
        milk_type: 'mix_milk',
        milk_weight: '',
        fat_percentage: '',
        snf_percentage: '',
        can_number: '',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to record collection';
      toast.error(errorMessage);
      console.error('Collection error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'driver') {
    return <Alert variant="info">This page is only for drivers</Alert>;
  }

  return (
    <div>
      <h2 className="mb-4 fw-bold" style={{ color: '#6F42C1' }}>Milk Collection</h2>
      {todayPrice ? (
        <Alert 
          className="mb-4 border-0"
          style={{
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderLeft: '4px solid #007BFF',
            color: '#007BFF'
          }}
        >
          <strong>Price Information:</strong> Base Price: ₹{todayPrice.base_price}/liter | 
          Fat Rate: ₹{todayPrice.fat_rate} | SNF Rate: ₹{todayPrice.snf_rate}
          {todayPrice.bonus > 0 && ` | Bonus: ₹${todayPrice.bonus}`}
        </Alert>
      ) : (
        <Alert 
          className="mb-4 border-0"
          style={{
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderLeft: '4px solid #FFC107',
            color: '#856404'
          }}
        >
          <strong>Warning:</strong> Price information not available. Please contact admin to set the price for this center.
        </Alert>
      )}
      <Card className="border-0 shadow-sm">
        <Card.Header 
          className="text-white border-0"
          style={{ 
            backgroundColor: '#6F42C1',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <h5 className="mb-0 fw-semibold">Collection Form</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dairy Center</Form.Label>
                  {/* vendor_id field removed - using center_id only */}
                  <Form.Select
                    value={formData.center_id}
                    onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                    required
                  >
                    <option value="">Select Center</option>
                    {centers.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.dairy_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Collection Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.collection_date}
                    onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Collection Time</Form.Label>
                  <Form.Select
                    value={formData.collection_time}
                    onChange={(e) => setFormData({ ...formData, collection_time: e.target.value })}
                    required
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Milk Type</Form.Label>
                  <Form.Select
                    value={formData.milk_type}
                    onChange={(e) => setFormData({ ...formData, milk_type: e.target.value })}
                    required
                  >
                    <option value="cow">Cow</option>
                    <option value="buffalo">Buffalo</option>
                    <option value="mix_milk">Mix Milk</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Milk Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.milk_weight}
                    onChange={(e) => setFormData({ ...formData, milk_weight: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fat %</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.fat_percentage}
                    onChange={(e) => setFormData({ ...formData, fat_percentage: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>SNF %</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.snf_percentage}
                    onChange={(e) => setFormData({ ...formData, snf_percentage: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Can Number (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={formData.can_number}
                onChange={(e) => setFormData({ ...formData, can_number: e.target.value })}
              />
            </Form.Group>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="fw-semibold py-2 px-4"
              style={{
                backgroundColor: '#6F42C1',
                borderColor: '#6F42C1',
                borderRadius: '8px'
              }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                'Submit Collection'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MilkCollection;

