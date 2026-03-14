import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { FiDroplet } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (user?.role === 'driver') {
        const response = await axios.get('/milk/collections', {
          params: { driver_id: user.id, limit: 10 }
        });
        setStats({ collections: response.data.data });
      } else {
        const response = await axios.get('/milk/collections', {
          params: { limit: 10 }
        });
        setStats({ collections: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div>
      <h2 className="mb-4 fw-bold" style={{ color: '#6F42C1' }}>Dashboard</h2>
      <Row className="g-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header 
              className="text-white border-0"
              style={{ 
                backgroundColor: '#6F42C1',
                borderRadius: '8px 8px 0 0'
              }}
            >
              <h5 className="mb-0 fw-semibold">
                <FiDroplet className="me-2" />
                Recent Collections
              </h5>
            </Card.Header>
            <Card.Body>
              {stats?.collections?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ color: '#6F42C1' }}>Date</th>
                        <th style={{ color: '#6F42C1' }}>Time</th>
                        <th style={{ color: '#6F42C1' }}>Weight (kg)</th>
                        <th style={{ color: '#6F42C1' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.collections.map((collection: any) => (
                        <tr key={collection.id}>
                          <td>{new Date(collection.collection_date).toLocaleDateString()}</td>
                          <td>
                            <span 
                              className="badge"
                              style={{
                                backgroundColor: collection.collection_time === 'morning' ? '#00CCCC' : '#007BFF',
                                color: 'white'
                              }}
                            >
                              {collection.collection_time}
                            </span>
                          </td>
                          <td className="fw-semibold">{collection.milk_weight} kg</td>
                          <td className="fw-semibold" style={{ color: '#6F42C1' }}>
                            ₹{collection.total_amount?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-5">
                  <FiDroplet size={48} style={{ color: '#6C757D', opacity: 0.5 }} />
                  <p className="text-muted mt-3 mb-0">No collections yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

