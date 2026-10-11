import React, { useState, useEffect } from 'react';
import { api, authStorage } from './services/api';

const CATEGORIES = [
  'Measuring Instruments',
  'Signal Generators',
  'Power Supplies',
  'Components & Kits',
  'Soldering & Tools',
  'Microcontrollers',
];

const DEPARTMENTS = ['ECE', 'EEE', 'CSE', 'MECH', 'CIVIL', 'IT'];

function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const [authStatus, setAuthStatus] = useState({ adminConfigured: true });
  const [portalMode, setPortalMode] = useState('student-login'); // 'student-login' | 'admin-login' | 'student-register' | 'admin-setup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  // Auth Form Fields
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [studentRegisterForm, setStudentRegisterForm] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    department: 'ECE',
    password: '',
    confirmPassword: '',
  });
  const [adminSetupForm, setAdminSetupForm] = useState({
    fullName: '',
    email: '',
    secretKey: 'ELECTRALAB_ADMIN_2026',
    password: '',
    confirmPassword: '',
  });

  // App Navigation & Dashboard Tabs
  const [activeTab, setActiveTab] = useState('inventory');
  const [health, setHealth] = useState({ status: 'CONNECTING', database: 'UNKNOWN' });
  const [globalLoading, setGlobalLoading] = useState(false);
  const [notification, setNotification] = useState({ type: null, message: null });

  // Data Collections
  const [equipmentList, setEquipmentList] = useState([]);
  const [allocationsList, setAllocationsList] = useState([]);
  const [studentAllocations, setStudentAllocations] = useState([]);
  const [studentDirectory, setStudentDirectory] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [studentRollFilter, setStudentRollFilter] = useState('');

  // Equipment Form (Admin Add/Edit)
  const [showEqModal, setShowEqModal] = useState(false);
  const [editingEqId, setEditingEqId] = useState(null);
  const [eqForm, setEqForm] = useState({
    name: '',
    modelNumber: '',
    category: 'Measuring Instruments',
    serialNumber: '',
    totalQuantity: 1,
    locationRack: '',
  });

  // Modal Dialogs for Allocation & Return
  const [requestModal, setRequestModal] = useState({
    isOpen: false,
    equipment: null,
    expectedReturnDate: '',
    remarks: '',
  });

  const [returnModal, setReturnModal] = useState({
    isOpen: false,
    allocationId: null,
    remarks: 'Apparatus inspected and returned in good working condition.',
  });

  // Student Feedback Form
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'MAINTENANCE_REPORT',
    subject: '',
    message: '',
  });

  // -------------------------------------------------------------
  // Initial Effects & Health Polling
  // -------------------------------------------------------------
  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth({ status: 'OFFLINE', database: 'DISCONNECTED' });
    }
  };

  const fetchAuthStatus = async () => {
    try {
      const status = await api.getAuthStatus();
      setAuthStatus(status);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    checkHealth();
    fetchAuthStatus();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------
  // Authentication Handlers
  // -------------------------------------------------------------
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const data = await api.login({
        email: loginForm.email.trim(),
        password: loginForm.password,
        portalRole: 'STUDENT',
      });
      authStorage.setToken(data.token);
      authStorage.setUser(data);
      setCurrentUser(data);
      setActiveTab('catalog');
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const data = await api.login({
        email: loginForm.email.trim(),
        password: loginForm.password,
        portalRole: 'ADMIN',
      });
      authStorage.setToken(data.token);
      authStorage.setUser(data);
      setCurrentUser(data);
      setActiveTab('inventory');
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    if (studentRegisterForm.password !== studentRegisterForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const data = await api.registerStudent({
        fullName: studentRegisterForm.fullName.trim(),
        email: studentRegisterForm.email.trim(),
        rollNumber: studentRegisterForm.rollNumber.trim(),
        department: studentRegisterForm.department,
        password: studentRegisterForm.password,
      });
      authStorage.setToken(data.token);
      authStorage.setUser(data);
      setCurrentUser(data);
      setActiveTab('catalog');
      setAuthSuccess('Student registration successful! Welcome to ElectraLab.');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminSetup = async (e) => {
    e.preventDefault();
    if (adminSetupForm.password !== adminSetupForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const data = await api.setupAdmin({
        fullName: adminSetupForm.fullName.trim(),
        email: adminSetupForm.email.trim(),
        secretKey: adminSetupForm.secretKey.trim(),
        password: adminSetupForm.password,
      });
      authStorage.setToken(data.token);
      authStorage.setUser(data);
      setCurrentUser(data);
      setActiveTab('inventory');
      setAuthStatus({ adminConfigured: true });
      setAuthSuccess('Initial administrator account provisioned successfully.');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    setCurrentUser(null);
    setPortalMode('student-login');
    setNotification({ type: null, message: null });
  };

  // -------------------------------------------------------------
  // Data Loading Helpers
  // -------------------------------------------------------------
  const loadEquipment = async () => {
    setGlobalLoading(true);
    try {
      const data = await api.getAllEquipment(selectedCategory, searchQuery);
      setEquipmentList(data);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setGlobalLoading(false);
    }
  };

  const loadAllAllocations = async () => {
    setGlobalLoading(true);
    try {
      const data = await api.getAllAllocations(studentRollFilter);
      setAllocationsList(data);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setGlobalLoading(false);
    }
  };

  const loadStudentAllocations = async () => {
    if (!currentUser || !currentUser.rollNumber) return;
    setGlobalLoading(true);
    try {
      const data = await api.getAllAllocations(currentUser.rollNumber);
      setStudentAllocations(data);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setGlobalLoading(false);
    }
  };

  const loadStudents = async () => {
    setGlobalLoading(true);
    try {
      const data = await api.getAllStudents();
      setStudentDirectory(data);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setGlobalLoading(false);
    }
  };

  const loadFeedback = async () => {
    setGlobalLoading(true);
    try {
      const data = await api.getAllFeedback();
      setFeedbackList(data);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setGlobalLoading(false);
    }
  };

  // Data fetching on tab change
  useEffect(() => {
    if (!currentUser) return;
    setNotification({ type: null, message: null });

    if (currentUser.role === 'ROLE_ADMIN') {
      if (activeTab === 'inventory') {
        loadEquipment();
      } else if (activeTab === 'allocations') {
        loadAllAllocations();
      } else if (activeTab === 'students') {
        loadStudents();
      } else if (activeTab === 'feedback') {
        loadFeedback();
      }
    } else {
      // ROLE_STUDENT
      if (activeTab === 'catalog') {
        loadEquipment();
      } else if (activeTab === 'my-borrowed') {
        loadStudentAllocations();
      } else if (activeTab === 'student-feedback') {
        loadFeedback();
      }
    }
  }, [currentUser, activeTab, selectedCategory, searchQuery, studentRollFilter]);

  // -------------------------------------------------------------
  // Admin Equipment CRUD
  // -------------------------------------------------------------
  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    setNotification({ type: null, message: null });
    try {
      if (editingEqId) {
        await api.updateEquipment(editingEqId, eqForm);
        setNotification({ type: 'success', message: 'Apparatus specifications updated successfully.' });
      } else {
        await api.createEquipment(eqForm);
        setNotification({ type: 'success', message: 'New apparatus registered into laboratory inventory.' });
      }
      setShowEqModal(false);
      setEditingEqId(null);
      setEqForm({
        name: '',
        modelNumber: '',
        category: 'Measuring Instruments',
        serialNumber: '',
        totalQuantity: 1,
        locationRack: '',
      });
      loadEquipment();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this apparatus from laboratory inventory?')) return;
    try {
      await api.deleteEquipment(id);
      setNotification({ type: 'success', message: 'Apparatus removed from inventory.' });
      loadEquipment();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleToggleMaintenance = async (id, currentStatus) => {
    const isCurrentlyUnderMaintenance = currentStatus === 'MAINTENANCE';
    try {
      await api.toggleEquipmentMaintenance(id, !isCurrentlyUnderMaintenance);
      setNotification({
        type: 'success',
        message: !isCurrentlyUnderMaintenance
          ? 'Apparatus flagged as UNDER MAINTENANCE.'
          : 'Apparatus cleared from maintenance and restored to AVAILABLE.',
      });
      loadEquipment();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // -------------------------------------------------------------
  // Student Allocation & Return Actions
  // -------------------------------------------------------------
  const submitRequestApparatus = async (e) => {
    e.preventDefault();
    if (!requestModal.equipment) return;
    try {
      await api.issueEquipment({
        studentName: currentUser.fullName,
        rollNumber: currentUser.rollNumber,
        equipmentId: requestModal.equipment.id,
        quantity: 1,
        expectedReturnDate: requestModal.expectedReturnDate,
        remarks: requestModal.remarks || 'Standard lab experimentation kit request',
      });
      setNotification({
        type: 'success',
        message: `Allocation confirmed! ${requestModal.equipment.name} has been assigned to your roll number.`,
      });
      setRequestModal({ isOpen: false, equipment: null, expectedReturnDate: '', remarks: '' });
      loadEquipment();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const submitReturnApparatus = async (e) => {
    e.preventDefault();
    if (!returnModal.allocationId) return;
    try {
      await api.returnEquipment(returnModal.allocationId, returnModal.remarks);
      setNotification({
        type: 'success',
        message: 'Apparatus returned successfully. Lab inventory count has been restored.',
      });
      setReturnModal({ isOpen: false, allocationId: null, remarks: '' });
      if (currentUser.role === 'ROLE_STUDENT') {
        loadStudentAllocations();
      } else {
        loadAllAllocations();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // -------------------------------------------------------------
  // Student Feedback & Admin Resolver
  // -------------------------------------------------------------
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.submitFeedback({
        studentName: currentUser.fullName,
        rollNumber: currentUser.rollNumber,
        type: feedbackForm.type,
        subject: feedbackForm.subject.trim(),
        message: feedbackForm.message.trim(),
      });
      setNotification({
        type: 'success',
        message: 'Feedback/Fault report submitted to lab administrators.',
      });
      setFeedbackForm({
        type: 'MAINTENANCE_REPORT',
        subject: '',
        message: '',
      });
      loadFeedback();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleResolveFeedback = async (id) => {
    try {
      await api.resolveFeedback(id);
      setNotification({ type: 'success', message: 'Report marked as RESOLVED.' });
      loadFeedback();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleToggleStudentStatus = async (student) => {
    try {
      await api.toggleStudentStatus(student.id, !student.active);
      setNotification({
        type: 'success',
        message: `Student account for ${student.fullName} has been ${student.active ? 'suspended' : 'activated'}.`,
      });
      loadStudents();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // -------------------------------------------------------------
  // RENDER: Unauthenticated Portal (Welcome, Login & Registration)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-inner">
            <div className="brand-wrapper">
              <h1 className="brand-title">Electra<span>Lab</span></h1>
              <span className="brand-subtitle">Electronics Laboratory Management System</span>
            </div>
            <div className="status-badge">
              <span className={`status-dot ${health.database === 'CONNECTED' ? 'connected' : 'disconnected'}`}></span>
              <span>Backend: {health.status} | DB: {health.database}</span>
            </div>
          </div>
        </header>

        <main className="portal-wrapper">
          <div className="portal-hero">
            <h2 className="portal-hero-title">Welcome to Electra<span>Lab</span></h2>
            <p className="portal-hero-desc">
              College Electronics Laboratory Portal for Equipment Allocations, Component Tracking, and Hardware Maintenance.
            </p>
          </div>

          <div className="portal-card">
            {/* Dual Portal Switcher Tabs */}
            <div className="portal-nav-tabs">
              <button
                type="button"
                className={`portal-tab-btn ${portalMode === 'student-login' ? 'active' : ''}`}
                onClick={() => {
                  setPortalMode('student-login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
              >
                🎓 Student Portal
              </button>
              <button
                type="button"
                className={`portal-tab-btn admin-tab ${portalMode === 'admin-login' ? 'active' : ''}`}
                onClick={() => {
                  setPortalMode('admin-login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
              >
                🔐 Administrator Portal
              </button>
            </div>

            <div className="portal-body">
              {authError && <div className="alert-box alert-error">{authError}</div>}
              {authSuccess && <div className="alert-box alert-success">{authSuccess}</div>}

              {/* 1. STUDENT LOGIN */}
              {portalMode === 'student-login' && (
                <form onSubmit={handleStudentLogin}>
                  <h3 className="portal-card-heading">Student Laboratory Login</h3>
                  <p className="portal-card-subheading">
                    Access available apparatus, view your issued components, and submit lab requests.
                  </p>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">College Email / Roll Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. rahul.21ec042@college.edu or 21EC042"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter your student password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="portal-btn-submit" disabled={authLoading}>
                    {authLoading ? 'Verifying Student Credentials...' : 'Sign In as Student'}
                  </button>

                  <div className="portal-footer-links">
                    <span>New student?</span>
                    <button
                      type="button"
                      className="portal-footer-link"
                      onClick={() => {
                        setPortalMode('student-register');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                    >
                      Register Student Account
                    </button>
                  </div>
                </form>
              )}

              {/* 2. ADMIN LOGIN */}
              {portalMode === 'admin-login' && (
                <form onSubmit={handleAdminLogin}>
                  <h3 className="portal-card-heading">Lab Administrator Login</h3>
                  <p className="portal-card-subheading">
                    Restricted access for laboratory instructors, technicians, and department staff.
                  </p>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Administrator Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. labincharge@electralab.edu"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Administrator Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter administrative password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="portal-btn-submit admin-submit" disabled={authLoading}>
                    {authLoading ? 'Verifying Admin Access...' : 'Sign In to Admin Dashboard'}
                  </button>

                  {!authStatus.adminConfigured && (
                    <div className="portal-footer-links" style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '6px', marginTop: '1rem' }}>
                      <span style={{ color: '#92400e', fontWeight: 600 }}>Initial Setup Required:</span>
                      <button
                        type="button"
                        className="portal-footer-link"
                        style={{ color: '#b45309' }}
                        onClick={() => {
                          setPortalMode('admin-setup');
                          setAuthError(null);
                          setAuthSuccess(null);
                        }}
                      >
                        Provision First Administrator
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* 3. STUDENT REGISTRATION */}
              {portalMode === 'student-register' && (
                <form onSubmit={handleStudentRegister}>
                  <h3 className="portal-card-heading">Register Student Account</h3>
                  <p className="portal-card-subheading">
                    Create an institutional student account to borrow lab kits and components.
                  </p>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rahul Sharma"
                        value={studentRegisterForm.fullName}
                        onChange={(e) => setStudentRegisterForm({ ...studentRegisterForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Roll Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 21EC042"
                        value={studentRegisterForm.rollNumber}
                        onChange={(e) => setStudentRegisterForm({ ...studentRegisterForm, rollNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={studentRegisterForm.department}
                        onChange={(e) => setStudentRegisterForm({ ...studentRegisterForm, department: e.target.value })}
                        required
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Institutional Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. rahul.21ec042@college.edu"
                        value={studentRegisterForm.email}
                        onChange={(e) => setStudentRegisterForm({ ...studentRegisterForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Min 6 characters"
                        value={studentRegisterForm.password}
                        onChange={(e) => setStudentRegisterForm({ ...studentRegisterForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Re-enter password"
                        value={studentRegisterForm.confirmPassword}
                        onChange={(e) => setStudentRegisterForm({ ...studentRegisterForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="portal-btn-submit" style={{ marginTop: '1.25rem' }} disabled={authLoading}>
                    {authLoading ? 'Creating Account...' : 'Complete Student Registration'}
                  </button>

                  <div className="portal-footer-links">
                    <span>Already have a student account?</span>
                    <button
                      type="button"
                      className="portal-footer-link"
                      onClick={() => {
                        setPortalMode('student-login');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                    >
                      Return to Student Login
                    </button>
                  </div>
                </form>
              )}

              {/* 4. INITIAL ADMIN PROVISIONING */}
              {portalMode === 'admin-setup' && (
                <form onSubmit={handleAdminSetup}>
                  <h3 className="portal-card-heading">Initial Administrator Provisioning</h3>
                  <p className="portal-card-subheading">
                    First-time setup. This endpoint permanently locks after the first administrator is created.
                  </p>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Admin Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. K. Ramanathan"
                      value={adminSetupForm.fullName}
                      onChange={(e) => setAdminSetupForm({ ...adminSetupForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Admin Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. labincharge@electralab.edu"
                      value={adminSetupForm.email}
                      onChange={(e) => setAdminSetupForm({ ...adminSetupForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Setup Secret Key</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Secret key (default: ELECTRALAB_ADMIN_2026)"
                      value={adminSetupForm.secretKey}
                      onChange={(e) => setAdminSetupForm({ ...adminSetupForm, secretKey: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Admin Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Min 6 characters"
                        value={adminSetupForm.password}
                        onChange={(e) => setAdminSetupForm({ ...adminSetupForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Re-enter password"
                        value={adminSetupForm.confirmPassword}
                        onChange={(e) => setAdminSetupForm({ ...adminSetupForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="portal-btn-submit admin-submit" style={{ marginTop: '1.25rem' }} disabled={authLoading}>
                    {authLoading ? 'Provisioning...' : 'Provision First Administrator'}
                  </button>

                  <div className="portal-footer-links">
                    <button
                      type="button"
                      className="portal-footer-link"
                      onClick={() => setPortalMode('admin-login')}
                    >
                      Return to Admin Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>

        <footer className="app-footer">
          ElectraLab &copy; 2026 &bull; Electronics Laboratory Management System &bull; Java 21, Spring Boot, MySQL &amp; React
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authenticated Dashboard (Student vs Admin)
  // -------------------------------------------------------------
  const isAdmin = currentUser.role === 'ROLE_ADMIN';

  return (
    <div className="app-container">
      {/* Top Application Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-wrapper">
            <h1 className="brand-title">Electra<span>Lab</span></h1>
            <span className="brand-subtitle">Electronics Laboratory Management System</span>
          </div>

          <div className="user-profile-controls">
            <div className="status-badge">
              <span className={`status-dot ${health.database === 'CONNECTED' ? 'connected' : 'disconnected'}`}></span>
              <span>DB: {health.database}</span>
            </div>

            <div className="user-badge">
              <span>{currentUser.fullName}</span>
              {currentUser.rollNumber && <span style={{ opacity: 0.8 }}>({currentUser.rollNumber})</span>}
              <span className={`role-pill ${isAdmin ? 'role-pill-admin' : 'role-pill-student'}`}>
                {isAdmin ? 'ADMIN' : 'STUDENT'}
              </span>
            </div>

            <button type="button" className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Role Navigation Bar */}
      <nav className="sub-nav">
        <div className="sub-nav-inner">
          {isAdmin ? (
            <>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                🔬 Equipment &amp; Kits Inventory
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'allocations' ? 'active' : ''}`}
                onClick={() => setActiveTab('allocations')}
              >
                📋 Allocations &amp; Return Records
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                👥 Student Directory
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedback')}
              >
                🛠️ Maintenance &amp; Fault Reports
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                🔬 Available Apparatus &amp; Kits
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'my-borrowed' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-borrowed')}
              >
                📦 My Borrowed Items &amp; Return
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'student-feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('student-feedback')}
              >
                ⚠️ Report Fault / Suggestion
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {notification.message && (
          <div className={`alert-box ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {notification.message}
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT VIEW 1: Available Apparatus & Components Catalog */}
        {/* ======================================================== */}
        {!isAdmin && activeTab === 'catalog' && (
          <div className="content-card">
            <div className="card-header-bar">
              <div>
                <h2 className="card-title">Laboratory Apparatus Catalog</h2>
                <p className="card-subtitle">
                  Browse available measurement instruments, IC trainer kits, and power sources. Click "Request Apparatus" to borrow.
                </p>
              </div>
            </div>

            <div className="filter-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by instrument name or model number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Apparatus Name</th>
                    <th>Model #</th>
                    <th>Category</th>
                    <th>Rack Location</th>
                    <th>Available Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        {globalLoading ? 'Loading equipment catalog...' : 'No apparatus found matching your criteria.'}
                      </td>
                    </tr>
                  ) : (
                    equipmentList.map((eq) => (
                      <tr key={eq.id}>
                        <td><strong>{eq.name}</strong></td>
                        <td>{eq.modelNumber || '—'}</td>
                        <td>{eq.category}</td>
                        <td>{eq.locationRack || 'Lab Bench'}</td>
                        <td>
                          <strong>{eq.availableQuantity}</strong> / {eq.totalQuantity}
                        </td>
                        <td>
                          {eq.status === 'AVAILABLE' && (
                            <span className="badge badge-available">AVAILABLE</span>
                          )}
                          {eq.status === 'IN_USE' && (
                            <span className="badge badge-in-use">ALL IN USE</span>
                          )}
                          {eq.status === 'MAINTENANCE' && (
                            <span className="badge badge-maintenance">UNDER MAINTENANCE</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-action-small"
                            disabled={eq.availableQuantity <= 0 || eq.status === 'MAINTENANCE'}
                            onClick={() =>
                              setRequestModal({
                                isOpen: true,
                                equipment: eq,
                                expectedReturnDate: '',
                                remarks: '',
                              })
                            }
                          >
                            {eq.availableQuantity > 0 && eq.status !== 'MAINTENANCE'
                              ? 'Request Kit'
                              : 'Unavailable'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT VIEW 2: My Borrowed Items & Return Action        */}
        {/* ======================================================== */}
        {!isAdmin && activeTab === 'my-borrowed' && (
          <div className="content-card">
            <div className="card-header-bar">
              <div>
                <h2 className="card-title">My Lab Allocations</h2>
                <p className="card-subtitle">
                  Apparatus and experiment kits currently allocated to roll number <strong>{currentUser.rollNumber}</strong>.
                </p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Allocation ID</th>
                    <th>Equipment Name</th>
                    <th>Quantity</th>
                    <th>Issue Date</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAllocations.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        {globalLoading ? 'Loading your allocations...' : 'You do not have any borrowed apparatus on record.'}
                      </td>
                    </tr>
                  ) : (
                    studentAllocations.map((alloc) => (
                      <tr key={alloc.id}>
                        <td>#{alloc.id}</td>
                        <td><strong>{alloc.equipmentName}</strong></td>
                        <td>{alloc.quantity}</td>
                        <td>{new Date(alloc.issueDate).toLocaleDateString()}</td>
                        <td>{alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : '—'}</td>
                        <td>
                          {alloc.status === 'ISSUED' ? (
                            <span className="badge badge-issued">ISSUED (ACTIVE)</span>
                          ) : (
                            <span className="badge badge-returned">RETURNED</span>
                          )}
                        </td>
                        <td>
                          {alloc.status === 'ISSUED' && (
                            <button
                              type="button"
                              className="btn-action-small"
                              onClick={() =>
                                setReturnModal({
                                  isOpen: true,
                                  allocationId: alloc.id,
                                  remarks: 'Returned in good condition after experiment completion.',
                                })
                              }
                            >
                              Return Apparatus
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT VIEW 3: Submit Lab Feedback & Maintenance Report */}
        {/* ======================================================== */}
        {!isAdmin && activeTab === 'student-feedback' && (
          <div className="content-card">
            <div className="card-header-bar">
              <div>
                <h2 className="card-title">Report Fault or Suggestion</h2>
                <p className="card-subtitle">
                  Notify lab in-charges regarding damaged probes, burnt components, or calibration issues.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitFeedback} style={{ maxWidth: '650px', marginBottom: '2rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Report Category</label>
                <select
                  className="form-select"
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                >
                  <option value="MAINTENANCE_REPORT">Apparatus Maintenance / Faulty Instrument</option>
                  <option value="EQUIPMENT_DAMAGE">Damaged Component / Missing Probe</option>
                  <option value="GENERAL_FEEDBACK">Lab Facility Feedback / Suggestion</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Subject / Instrument ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CRO Channel 2 ground noise issue on Bench 4"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Provide details about the issue observed during your experiment..."
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit Report to Lab In-Charge
              </button>
            </form>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>
              Your Submitted Tickets &amp; Status
            </h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.filter((f) => f.rollNumber === currentUser.rollNumber).length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        No past tickets submitted from your roll number.
                      </td>
                    </tr>
                  ) : (
                    feedbackList
                      .filter((f) => f.rollNumber === currentUser.rollNumber)
                      .map((item) => (
                        <tr key={item.id}>
                          <td>#{item.id}</td>
                          <td>{item.type}</td>
                          <td><strong>{item.subject}</strong></td>
                          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td>
                            {item.status === 'RESOLVED' ? (
                              <span className="badge badge-available">RESOLVED</span>
                            ) : (
                              <span className="badge badge-in-use">PENDING REVIEW</span>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADMIN VIEW 1: Equipment & Kits Inventory Management      */}
        {/* ======================================================== */}
        {isAdmin && activeTab === 'inventory' && (
          <div className="content-card">
            <div className="card-header-bar">
              <div>
                <h2 className="card-title">Laboratory Equipment &amp; Kit Inventory</h2>
                <p className="card-subtitle">
                  Manage measurement apparatus, trainer kits, stock counts, and maintenance flags.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setEditingEqId(null);
                  setEqForm({
                    name: '',
                    modelNumber: '',
                    category: 'Measuring Instruments',
                    serialNumber: '',
                    totalQuantity: 1,
                    locationRack: '',
                  });
                  setShowEqModal(true);
                }}
              >
                + Register New Apparatus
              </button>
            </div>

            <div className="filter-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by apparatus name or model number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Apparatus Name</th>
                    <th>Model #</th>
                    <th>Category</th>
                    <th>Serial #</th>
                    <th>Rack</th>
                    <th>Stock (Avail/Total)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        {globalLoading ? 'Loading inventory data...' : 'No equipment records in inventory.'}
                      </td>
                    </tr>
                  ) : (
                    equipmentList.map((eq) => (
                      <tr key={eq.id}>
                        <td><strong>{eq.name}</strong></td>
                        <td>{eq.modelNumber || '—'}</td>
                        <td>{eq.category}</td>
                        <td>{eq.serialNumber || '—'}</td>
                        <td>{eq.locationRack || '—'}</td>
                        <td>
                          <strong>{eq.availableQuantity}</strong> / {eq.totalQuantity}
                        </td>
                        <td>
                          {eq.status === 'AVAILABLE' && (
                            <span className="badge badge-available">AVAILABLE</span>
                          )}
                          {eq.status === 'IN_USE' && (
                            <span className="badge badge-in-use">IN USE</span>
                          )}
                          {eq.status === 'MAINTENANCE' && (
                            <span className="badge badge-maintenance">MAINTENANCE</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-action-small"
                              onClick={() => {
                                setEditingEqId(eq.id);
                                setEqForm({
                                  name: eq.name,
                                  modelNumber: eq.modelNumber || '',
                                  category: eq.category,
                                  serialNumber: eq.serialNumber || '',
                                  totalQuantity: eq.totalQuantity,
                                  locationRack: eq.locationRack || '',
                                });
                                setShowEqModal(true);
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn-action-small"
                              style={{
                                backgroundColor: eq.status === 'MAINTENANCE' ? '#dcfce7' : '#fee2e2',
                                color: eq.status === 'MAINTENANCE' ? '#15803d' : '#991b1b',
                                borderColor: eq.status === 'MAINTENANCE' ? '#86efac' : '#fca5a5',
                              }}
                              onClick={() => handleToggleMaintenance(eq.id, eq.status)}
                            >
                              {eq.status === 'MAINTENANCE' ? 'Clear Maint' : 'Set Maint'}
                            </button>

                            <button
                              type="button"
                              className="btn-danger-outline"
                              onClick={() => handleDeleteEquipment(eq.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADMIN VIEW 2: Allocations & Return Records               */}
        {/* ======================================================== */}
        {isAdmin && activeTab === 'allocations' && (
          <div className="content-card">
            <div className="card-header-bar">
              <div>
                <h2 className="card-title">Laboratory Allocations Registry</h2>
                <p className="card-subtitle">
                  Inspect student borrowing records, issue new kits, and process equipment returns.
                </p>
              </div>
            </div>

            <div className="filter-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Filter by Student Roll Number (e.g. 21EC042)..."
                value={studentRollFilter}
                onChange={(e) => setStudentRollFilter(e.target.value)}
              />
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Apparatus Name</th>
                    <th>Issue Date</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allocationsList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        {globalLoading ? 'Loading allocations...' : 'No allocation records matching query.'}
                      </td>
                    </tr>
                  ) : (
                    allocationsList.map((alloc) => (
                      <tr key={alloc.id}>
                        <td>#{alloc.id}</td>
                        <td><strong>{alloc.studentName}</strong></td>
                        <td>{alloc.rollNumber}</td>
                        <td>{alloc.equipmentName}</td>
                        <td>{new Date(alloc.issueDate).toLocaleDateString()}</td>
                        <td>{alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : '—'}</td>
                        <td>
                          {alloc.status === 'ISSUED' ? (
                            <span className="badge badge-issued">ISSUED</span>
                          ) : (
                            <span className="badge badge-returned">RETURNED</span>
                          )}
                        </td>
                        <td>
                          {alloc.status === 'ISSUED' && (
                            <button
                              type="button"
                              className="btn-action-small"
                              onClick={() =>
                                setReturnModal({
                                  isOpen: true,
                                  allocationId: alloc.id,
                                  remarks: 'Verified and returned in working order by lab technician.',
                                })
                              }
                            >
                              Process Return
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADMIN VIEW 3: Student Directory & Status Management      */}
        {/* ======================================================== */}
        {isAdmin && activeTab === 'students' && (
          <div className="content-card">
            <div className="card-header-bar">
              <div>
                <h2 className="card-title">Registered Student Directory</h2>
                <p className="card-subtitle">
                  Verify enrolled students and manage laboratory access permissions.
                </p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Roll Number</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Account Status</th>
                    <th>Access Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentDirectory.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        {globalLoading ? 'Loading student directory...' : 'No student accounts registered yet.'}
                      </td>
                    </tr>
                  ) : (
                    studentDirectory.map((student) => (
                      <tr key={student.id}>
                        <td>#{student.id}</td>
                        <td><strong>{student.fullName}</strong></td>
                        <td>{student.rollNumber}</td>
                        <td>{student.department}</td>
                        <td>{student.email}</td>
                        <td>
                          {student.active ? (
                            <span className="badge badge-available">ACTIVE</span>
                          ) : (
                            <span className="badge badge-maintenance">SUSPENDED</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-action-small"
                            style={{
                              backgroundColor: student.active ? '#fee2e2' : '#dcfce7',
                              color: student.active ? '#991b1b' : '#15803d',
                              borderColor: student.active ? '#fca5a5' : '#86efac',
                            }}
                            onClick={() => handleToggleStudentStatus(student)}
                          >
                            {student.active ? 'Suspend Access' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADMIN VIEW 4: Maintenance & Fault Reports Queue          */}
        {/* ======================================================== */}
        {isAdmin && activeTab === 'feedback' && (
          <div className="content-card">
            <div className="card-header-bar">
              <div>
                <h2 className="card-title">Lab Maintenance &amp; Fault Queue</h2>
                <p className="card-subtitle">
                  Review student reports regarding broken hardware, loose connections, or bench faults.
                </p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Report Date</th>
                    <th>Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        {globalLoading ? 'Loading maintenance queue...' : 'No incident or maintenance reports submitted.'}
                      </td>
                    </tr>
                  ) : (
                    feedbackList.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{item.studentName}</td>
                        <td>{item.rollNumber}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.type}</span>
                        </td>
                        <td><strong>{item.subject}</strong></td>
                        <td style={{ maxWidth: '300px', fontSize: '0.8rem' }}>{item.message}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          {item.status === 'RESOLVED' ? (
                            <span className="badge badge-available">RESOLVED</span>
                          ) : (
                            <button
                              type="button"
                              className="btn-action-small"
                              onClick={() => handleResolveFeedback(item.id)}
                            >
                              Resolve Ticket
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: Admin Apparatus Add/Edit Form                   */}
      {/* ======================================================== */}
      {showEqModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingEqId ? 'Edit Apparatus Specifications' : 'Register New Apparatus'}
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEqModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveEquipment}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Apparatus / Equipment Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Digital Storage Oscilloscope"
                  value={eqForm.name}
                  onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Model Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. DSO-X 2012A"
                    value={eqForm.modelNumber}
                    onChange={(e) => setEqForm({ ...eqForm, modelNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={eqForm.category}
                    onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })}
                    required
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. DSO-SN-8821"
                    value={eqForm.serialNumber}
                    onChange={(e) => setEqForm({ ...eqForm, serialNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Rack</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rack A-1 Bench 3"
                    value={eqForm.locationRack}
                    onChange={(e) => setEqForm({ ...eqForm, locationRack: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Total Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={eqForm.totalQuantity}
                  onChange={(e) => setEqForm({ ...eqForm, totalQuantity: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingEqId ? 'Save Changes' : 'Add to Inventory'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEqModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Student Request Apparatus Modal                 */}
      {/* ======================================================== */}
      {requestModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Request Apparatus Allocation</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setRequestModal({ isOpen: false, equipment: null, expectedReturnDate: '', remarks: '' })}
              >
                &times;
              </button>
            </div>
            <form onSubmit={submitRequestApparatus}>
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {requestModal.equipment?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Model: {requestModal.equipment?.modelNumber} &bull; Rack: {requestModal.equipment?.locationRack || 'Bench'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#0d9488', marginTop: '0.25rem', fontWeight: 600 }}>
                  Available in Lab: {requestModal.equipment?.availableQuantity} units
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input type="text" className="form-input" value={currentUser.fullName} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input type="text" className="form-input" value={currentUser.rollNumber} disabled />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Expected Return Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={requestModal.expectedReturnDate}
                  onChange={(e) => setRequestModal({ ...requestModal, expectedReturnDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Experiment Purpose / Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Analog Circuits Lab Experiment 3"
                  value={requestModal.remarks}
                  onChange={(e) => setRequestModal({ ...requestModal, remarks: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Confirm Apparatus Request
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRequestModal({ isOpen: false, equipment: null, expectedReturnDate: '', remarks: '' })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Return Equipment Modal                          */}
      {/* ======================================================== */}
      {returnModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Return Apparatus Confirmation</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setReturnModal({ isOpen: false, allocationId: null, remarks: '' })}
              >
                &times;
              </button>
            </div>
            <form onSubmit={submitReturnApparatus}>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
                Confirming the return will update the lab inventory stock and mark allocation #{returnModal.allocationId} as RETURNED.
              </p>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Return Inspection Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. All probes, cables, and components returned in good condition."
                  value={returnModal.remarks}
                  onChange={(e) => setReturnModal({ ...returnModal, remarks: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Confirm Return
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setReturnModal({ isOpen: false, allocationId: null, remarks: '' })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Footer */}
      <footer className="app-footer">
        ElectraLab &copy; 2026 &bull; Electronics Laboratory Management System &bull; Java 21, Spring Boot, MySQL &amp; React
      </footer>
    </div>
  );
}

export default App;
