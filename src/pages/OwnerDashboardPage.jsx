import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js';
import useAuth from '../context/useAuth.js';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal.jsx'; // 1. Import Modal

function OwnerDashboardPage() {
  const { user } = useAuth();
  const [academy, setAcademy] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', actions: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Find the Owner's Academy
        const academiesResponse = await apiClient.get('/academies');
        const myAcademy = academiesResponse.data.find(a => a.user_id === user.id);

        if (!myAcademy) {
          setError("You don't appear to have an academy listed.");
          setLoading(false);
          return;
        }

        setAcademy(myAcademy);

        // Fetch Pending Orders
        const itemsResponse = await apiClient.get(`/academies/${myAcademy.id}/order_line_items`, {
          params: { status: 'pending_approval' }
        });
        
        setPendingItems(itemsResponse.data);

      } catch (err) {
        console.error("Dashboard Error", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // 3. Helper to show the modal
  const showAlert = (title, message) => {
    setModalConfig({
      title,
      message,
      actions: (
        <button 
          onClick={() => setModalOpen(false)}
          style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          OK
        </button>
      )
    });
    setModalOpen(true);
  };

  const handleReview = async (itemId, newStatus) => {
    try {
      await apiClient.patch(`/order_line_items/${itemId}`, {
        order_line_item: { status: newStatus }
      });

      // Optimistic UI update
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      
      // 4. Use Modal instead of alert()
      showAlert("Success", `Item ${newStatus} successfully.`);

    } catch (err) {
      console.error("Review failed", err);
      // 4. Use Modal instead of alert()
      showAlert("Error", "Failed to update item. Please try again.");
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      {/* 5. Render the Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        actions={modalConfig.actions}
      >
        {modalConfig.message}
      </Modal>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Owner Dashboard</h1>
        {academy && <span style={{ color: '#666', fontWeight: 'bold' }}>{academy.name}</span>}
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Pending Approvals</h3>
        
        {pendingItems.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No pending orders to review.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '0.5rem' }}>Item</th>
                <th style={{ padding: '0.5rem' }}>Qty</th>
                <th style={{ padding: '0.5rem' }}>Value</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                     Pass #{item.pass_id} (Order #{item.order_id})
                  </td>
                  <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                  <td style={{ padding: '0.5rem' }}>${(item.price_at_purchase_cents / 100).toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleReview(item.id, 'rejected')}
                      style={{ padding: '0.25rem 0.75rem', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleReview(item.id, 'approved')}
                      style={{ padding: '0.25rem 0.75rem', background: '#003580', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboardPage;