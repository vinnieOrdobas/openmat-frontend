import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js';
import useAuth from '../context/useAuth.js';
import Modal from '../components/Modal.jsx';

// --- Helper for Day Names ---
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --- Helper for Pass Types ---
const PASS_TYPES = [
  { value: 'single', label: 'Single Class Drop-in' },
  { value: 'punch_card', label: 'Punch Card (Multiple Classes)' },
  { value: 'day_pass', label: 'Day Pass (24 Hours)' },
  { value: 'week_pass', label: 'Week Pass (7 Days)' },
  { value: 'month_pass', label: 'Month Pass (30 Days)' },
];

function OwnerDashboardPage() {
  const { user } = useAuth();
  const [academy, setAcademy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Tabs State ---
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'schedule', or 'passes'

  // --- Data State ---
  const [pendingItems, setPendingItems] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [passes, setPasses] = useState([]); // <--- NEW

  // --- Form State ---
  const [newClass, setNewClass] = useState({ title: '', day_of_week: 1, start_time: '', end_time: '' });
  
  const [newPass, setNewPass] = useState({ 
    name: '', 
    description: '', 
    price_dollars: '',
    pass_type: 'single',
    class_credits: '' 
  });

  // --- Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', actions: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const academiesResponse = await apiClient.get('/academies');
        const myAcademy = academiesResponse.data.find(a => a.user_id === user.id);

        if (!myAcademy) {
          setError("You don't appear to have an academy listed.");
          setLoading(false);
          return;
        }

        setAcademy(myAcademy);

        // 2. Fetch Pending Orders
        const itemsResponse = await apiClient.get(`/academies/${myAcademy.id}/order_line_items`, {
          params: { status: 'pending_approval' }
        });
        setPendingItems(itemsResponse.data);

        const schedResponse = await apiClient.get(`/academies/${myAcademy.id}/class_schedules`);
        setSchedules(schedResponse.data);

        const academyDetail = await apiClient.get(`/academies/${myAcademy.id}`);
        setPasses(academyDetail.data.passes);

      } catch (err) {
        console.error("Dashboard Error", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // --- Helper to show modal ---
  const showAlert = (title, message) => {
    setModalConfig({
      title,
      message,
      actions: <button onClick={() => setModalOpen(false)} style={btnStyle}>OK</button>
    });
    setModalOpen(true);
  };

  // --- Order Handlers ---
  const handleReview = async (itemId, newStatus) => {
    try {
      await apiClient.patch(`/order_line_items/${itemId}`, { order_line_item: { status: newStatus } });
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      showAlert("Success", `Item ${newStatus} successfully.`);
    } catch (err) {
      showAlert("Error", "Failed to update item.");
    }
  };

  // --- Schedule Handlers ---
  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(`/academies/${academy.id}/class_schedules`, {
        class_schedule: newClass
      });
      setSchedules([...schedules, response.data]); 
      setNewClass({ title: '', day_of_week: 1, start_time: '', end_time: '' }); 
      showAlert("Success", "Class added to schedule.");
    } catch (err) {
      showAlert("Error", err.response?.data?.errors?.join(", ") || "Failed to add class.");
    }
  };

  const handleDeleteClass = async (scheduleId) => {
    if (!confirm("Are you sure you want to delete this class?")) return; 
    try {
      await apiClient.delete(`/academies/${academy.id}/class_schedules/${scheduleId}`);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (err) {
      showAlert("Error", "Failed to delete class.");
    }
  };

  // --- Pass Handlers (NEW) ---
  const handleAddPass = async (e) => {
    e.preventDefault();
    try {
      // Convert dollars to cents
      const priceCents = Math.round(parseFloat(newPass.price_dollars) * 100);
      
      const payload = {
        pass: {
          name: newPass.name,
          description: newPass.description,
          price_cents: priceCents,
          pass_type: newPass.pass_type,
          // Only send class_credits if type is punch_card
          class_credits: newPass.pass_type === 'punch_card' ? parseInt(newPass.class_credits) : null
        }
      };

      const response = await apiClient.post(`/academies/${academy.id}/passes`, payload);
      setPasses([...passes, response.data]);
      setNewPass({ name: '', description: '', price_dollars: '', pass_type: 'single', class_credits: '' });
      showAlert("Success", "Pass created successfully.");
    } catch (err) {
      showAlert("Error", err.response?.data?.errors?.join(", ") || "Failed to create pass.");
    }
  };

  const handleDeletePass = async (passId) => {
    if (!confirm("Are you sure? This will prevent future sales of this pass.")) return;
    try {
      await apiClient.delete(`/academies/${academy.id}/passes/${passId}`);
      setPasses(prev => prev.filter(p => p.id !== passId));
    } catch (err) {
      showAlert("Error", "Failed to delete pass.");
    }
  };


  // Styles
  const btnStyle = { padding: '0.5rem 1rem', background: '#003580', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
  const tabStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #003580' : '3px solid transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#003580' : '#666'
  });

  if (loading) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalConfig.title} actions={modalConfig.actions}>{modalConfig.message}</Modal>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Owner Dashboard</h1>
        {academy && <span style={{ color: '#666', fontWeight: 'bold' }}>{academy.name}</span>}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '1.5rem' }}>
        <div onClick={() => setActiveTab('orders')} style={tabStyle(activeTab === 'orders')}>Orders</div>
        <div onClick={() => setActiveTab('schedule')} style={tabStyle(activeTab === 'schedule')}>Schedule</div>
        <div onClick={() => setActiveTab('passes')} style={tabStyle(activeTab === 'passes')}>Passes</div>
      </div>

      {/* --- TAB: ORDERS --- */}
      {activeTab === 'orders' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0 }}>Pending Approvals</h3>
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
                    <td style={{ padding: '0.75rem 0.5rem' }}>Pass #{item.pass_id} (Order #{item.order_id})</td>
                    <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                    <td style={{ padding: '0.5rem' }}>${(item.price_at_purchase_cents / 100).toFixed(2)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => handleReview(item.id, 'rejected')} style={{ ...btnStyle, background: 'white', border: '1px solid #d32f2f', color: '#d32f2f' }}>Reject</button>
                      <button onClick={() => handleReview(item.id, 'approved')} style={btnStyle}>Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* --- TAB: SCHEDULE --- */}
      {activeTab === 'schedule' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0 }}>Manage Schedule</h3>
          {/* Form */}
          <form onSubmit={handleAddClass} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Class Title</label>
              <input type="text" required value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} placeholder="e.g. Advanced Gi" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Day</label>
              <select value={newClass.day_of_week} onChange={e => setNewClass({...newClass, day_of_week: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Start</label>
              <input type="time" required value={newClass.start_time} onChange={e => setNewClass({...newClass, start_time: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>End</label>
              <input type="time" required value={newClass.end_time} onChange={e => setNewClass({...newClass, end_time: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={btnStyle}>Add</button>
          </form>
          {/* List */}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {schedules.sort((a, b) => a.day_of_week - b.day_of_week).map(s => (
              <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <strong>{DAYS[s.day_of_week]}</strong> {s.start_time} - {s.end_time} <br/>
                  <span style={{ color: '#555' }}>{s.title}</span>
                </div>
                <button onClick={() => handleDeleteClass(s.id)} style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- TAB: PASSES (NEW) --- */}
      {activeTab === 'passes' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0 }}>Manage Passes</h3>
          
          {/* Add Pass Form */}
          <form onSubmit={handleAddPass} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Pass Name</label>
              <input type="text" required value={newPass.name} onChange={e => setNewPass({...newPass, name: e.target.value})} placeholder="e.g. 10 Class Card" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Description</label>
              <input type="text" value={newPass.description} onChange={e => setNewPass({...newPass, description: e.target.value})} placeholder="Short description..." style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Type</label>
              <select value={newPass.pass_type} onChange={e => setNewPass({...newPass, pass_type: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                {PASS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Price ($)</label>
              <input type="number" step="0.01" required value={newPass.price_dollars} onChange={e => setNewPass({...newPass, price_dollars: e.target.value})} placeholder="20.00" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            {newPass.pass_type === 'punch_card' && (
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Credits</label>
                <input type="number" required value={newPass.class_credits} onChange={e => setNewPass({...newPass, class_credits: e.target.value})} placeholder="10" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
            )}
            
            <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
              <button type="submit" style={btnStyle}>Create Pass</button>
            </div>
          </form>

          {/* Pass List */}
          {passes.length === 0 ? (
            <p>No passes created yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {passes.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #eee', borderRadius: '6px' }}>
                  <div>
                    <strong>{p.name}</strong> - ${ (p.price_cents/100).toFixed(2) }
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      Type: {p.pass_type} {p.class_credits ? `(${p.class_credits} credits)` : ''}
                    </div>
                  </div>
                  <button onClick={() => handleDeletePass(p.id)} style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default OwnerDashboardPage;