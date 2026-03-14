import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiDroplet, FiDollarSign, FiLogOut, FiPower } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [isDriverActive, setIsDriverActive] = useState(true);

  useEffect(() => {
    if (user?.role === 'driver') {
      fetchDutyStatus();
    }
  }, [user]);

  const fetchDutyStatus = async () => {
    try {
      const response = await axios.get('/driver/status');
      if (response.data.success && response.data.data) {
        setIsOnDuty(response.data.data.is_on_duty || false);
        setIsDriverActive(response.data.data.is_active !== false);
      }
    } catch (error: any) {
      console.error('Failed to fetch duty status:', error);
      setIsOnDuty(false);
      // If error is 403, driver might be inactive
      if (error.response?.status === 403) {
        setIsDriverActive(false);
      }
    }
  };

  const toggleDuty = async () => {
    try {
      const newStatus = !isOnDuty;
      const response = await axios.patch('/driver/duty-status', { is_on_duty: newStatus });
      
      if (response.data.success) {
        // Use the actual updated status from server response
        if (response.data.data && typeof response.data.data.is_on_duty === 'boolean') {
          setIsOnDuty(response.data.data.is_on_duty);
        } else {
          // Fallback to the status we sent
          setIsOnDuty(newStatus);
        }
        
        // Always fetch fresh status from server to ensure consistency
        await fetchDutyStatus();
        
        toast.success(`Duty ${response.data.data?.is_on_duty ?? newStatus ? 'started' : 'ended'}`);
      } else {
        // If response doesn't indicate success, refresh from server
        await fetchDutyStatus();
        toast.error('Failed to update duty status');
      }
    } catch (error: any) {
      console.error('Toggle duty error:', error);
      toast.error(error.response?.data?.message || 'Failed to update duty status');
      // Always refresh status on error to get correct state
      await fetchDutyStatus();
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/collection', label: 'Milk Collection', icon: FiDroplet },
    { path: '/payments', label: 'Payments', icon: FiDollarSign },
  ];

  return (
    <div className="d-flex flex-column vh-100" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Top Navbar - Azia Style */}
      <nav 
        className="navbar navbar-dark"
        style={{
          background: 'linear-gradient(135deg, #6F42C1 0%, #5a32a3 100%)',
          boxShadow: '0 2px 8px rgba(111, 66, 193, 0.2)'
        }}
      >
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 fw-bold">Akshaya Dairy</span>
          <div className="d-flex align-items-center">
            {user?.role === 'driver' && (
              <button
                className={`btn btn-sm me-3 text-white fw-semibold`}
                onClick={toggleDuty}
                disabled={!isDriverActive}
                title={!isDriverActive ? 'Your account is inactive. Please contact admin.' : ''}
                style={{
                  backgroundColor: isOnDuty ? '#00CCCC' : '#17A2B8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 16px'
                }}
                onMouseEnter={(e) => {
                  if (!isDriverActive) return;
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!isDriverActive) return;
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <FiPower className="me-1" />
                {isOnDuty ? 'On Duty' : 'Off Duty'}
              </button>
            )}
            {user?.role === 'driver' && !isDriverActive && (
              <span 
                className="badge me-3"
                style={{ 
                  backgroundColor: '#FFC107', 
                  color: '#212529',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}
              >
                Account Inactive
              </span>
            )}
            <span className="text-white me-3 fw-semibold">
              {user?.first_name} {user?.last_name}
            </span>
            <button 
              className="btn btn-outline-light btn-sm fw-semibold" 
              onClick={logout}
              style={{ borderRadius: '6px' }}
            >
              <FiLogOut className="me-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="d-flex flex-grow-1">
        {/* Sidebar - Azia Style */}
        <nav 
          className="p-3"
          style={{ 
            width: '200px',
            backgroundColor: '#F8F9FA',
            borderRight: '1px solid #e0e0e0',
            minHeight: 'calc(100vh - 56px)'
          }}
        >
          <ul className="list-unstyled">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isDisabled = user?.role === 'driver' && !isDriverActive && item.path !== '/dashboard';
              return (
                <li key={item.path} className="mb-2">
                  {isDisabled ? (
                    <span
                      className={`d-flex align-items-center text-decoration-none p-2 rounded text-muted`}
                      style={{ cursor: 'not-allowed', opacity: 0.5 }}
                      title="Your account is inactive. Please contact admin."
                    >
                      <Icon className="me-2" />
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path}
                      className={`d-flex align-items-center text-decoration-none p-2 rounded`}
                      style={{
                        backgroundColor: isActive ? '#6F42C1' : 'transparent',
                        color: isActive ? 'white' : '#212529',
                        transition: 'all 0.2s ease',
                        fontWeight: isActive ? '600' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(111, 66, 193, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon className="me-2" />
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Main Content - Azia White Background */}
        <main className="flex-grow-1 p-4" style={{ backgroundColor: '#FFFFFF', minHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

