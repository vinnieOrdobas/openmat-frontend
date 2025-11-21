import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js';
import Modal from '../components/Modal.jsx'; // Import Modal

// ... (StatusBadge component remains the same, omitting for brevity) ...
const StatusBadge = ({ status, small }) => {
  let color = '#666';
  let bg = '#eee';
  switch (status) {
    case 'completed': case 'approved': case 'succeeded': color = '#064e3b'; bg = '#d1fae5'; break;
    case 'pending_approval': case 'awaiting_approvals': color = '#92400e'; bg = '#fef3c7'; break;
    case 'rejected': color = '#991b1b'; bg = '#fee2e2'; break;
  }
  return <span style={{ backgroundColor: bg, color, padding: small ? '2px 6px' : '4px 8px', borderRadius: '4px', fontSize: small ? '0.75rem' : '0.85rem', fontWeight: '600', textTransform: 'capitalize', display: 'inline-block' }}>{status ? status.replace('_', ' ') : 'Unknown'}</span>;
};

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', actions: null });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showAlert = (title, message) => {
    setModalConfig({
      title,
      message,
      actions: <button onClick={() => setModalOpen(false)} style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>OK</button>
    });
    setModalOpen(true);
  };

  const confirmPayment = (orderId) => {
    setModalConfig({
      title: "Confirm Payment",
      message: "This is a mock payment. Confirm to activate your passes.",
      actions: (
        <>
          <button onClick={() => setModalOpen(false)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => executePayment(orderId)} style={{ padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: '0.5rem' }}>Pay Now</button>
        </>
      )
    });
    setModalOpen(true);
  };

  const executePayment = async (orderId) => {
    try {
      setModalOpen(false);
      setPayingOrderId(orderId);
      await apiClient.post(`/orders/${orderId}/confirmation`);
      showAlert("Success", "Payment successful! Passes activated.");
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (err) {
      showAlert("Payment Failed", err.response?.data?.errors || "Unknown error");
    } finally {
      setPayingOrderId(null);
    }
  };

  const handlePay = (orderId) => {
    confirmPayment(orderId);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading orders...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalConfig.title} actions={modalConfig.actions}>{modalConfig.message}</Modal>
      <h2 style={{ marginBottom: '1.5rem' }}>Order History</h2>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const isReadyToPay = order.status === 'awaiting_approvals' && order.order_line_items.every(item => item.status === 'approved');
            
            return (
              <div key={order.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>Order #{order.id}</strong>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>${(order.total_price_cents / 100).toFixed(2)}</div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase', color: '#888' }}>Items</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {order.order_line_items.map(item => (
                      <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        <span><span style={{ fontWeight: 'bold' }}>{item.quantity}x</span> Pass (ID: {item.pass_id})</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span>${(item.price_at_purchase_cents / 100).toFixed(2)}</span>
                          <StatusBadge status={item.status} small />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  {order.status === 'completed' && <span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Paid & Active</span>}
                  {order.status === 'awaiting_approvals' && !isReadyToPay && <span style={{ color: '#d97706', fontStyle: 'italic', fontSize: '0.9rem' }}>Waiting for academy approval before payment...</span>}
                  {isReadyToPay && (
                    <button 
                      onClick={() => handlePay(order.id)}
                      disabled={payingOrderId === order.id}
                      style={{ padding: '0.75rem 1.5rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: payingOrderId === order.id ? 0.7 : 1 }}
                    >
                      {payingOrderId === order.id ? 'Processing...' : 'Confirm & Pay Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;