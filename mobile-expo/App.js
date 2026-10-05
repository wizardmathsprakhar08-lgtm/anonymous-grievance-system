import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Image
} from 'react-native';
import { api, getApiBaseUrl, setApiBaseUrl } from './src/services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'track' | 'officer' | 'settings'

  // Submit State
  const [text, setText] = useState('');
  const [categoryHint, setCategoryHint] = useState('');
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // In-App Stored Complaints
  const [myComplaints, setMyComplaints] = useState([]);

  // Track & Feed State
  const [trackSubView, setTrackSubView] = useState('my'); // 'my' | 'feed' | 'search'
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [publicFeed, setPublicFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');

  // Officer State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [officerUser, setOfficerUser] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [actionNote, setActionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Server Settings State
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);

  // ---------------- SUBMIT LOGIC ----------------
  const handleSubmitGrievance = async () => {
    if (!text.trim() || text.length < 5) {
      Alert.alert('Error', 'Please describe the grievance (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitGrievance(text, categoryHint || null, mediaUrl || null, mediaType || null);
      setSubmitResult(res);
      setTrackingIdInput(res.tracking_id);
      
      // Store in device complaints list
      setMyComplaints(prev => [res, ...prev.filter(x => x.tracking_id !== res.tracking_id)]);
      
      setText('');
      setCategoryHint('');
      setMediaUrl(null);
    } catch (err) {
      Alert.alert('Submission Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- TRACK & FEED LOGIC ----------------
  const handleTrackGrievance = async (idToSearch) => {
    const id = (idToSearch || trackingIdInput).trim();
    if (!id) {
      Alert.alert('Error', 'Please enter a Tracking ID.');
      return;
    }

    setTrackingLoading(true);
    setTrackingData(null);
    setTrackSubView('search');
    try {
      const res = await api.getGrievance(id);
      setTrackingData(res);
    } catch (err) {
      Alert.alert('Lookup Error', err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleFetchFeed = async () => {
    setFeedLoading(true);
    try {
      const res = await api.getPublicFeed(feedFilter);
      setPublicFeed(res || []);
    } catch (err) {
      console.log('Error fetching feed', err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'track' && trackSubView === 'feed') {
      handleFetchFeed();
    }
  }, [activeTab, trackSubView, feedFilter]);

  // ---------------- OFFICER LOGIC ----------------
  const handleLogin = async (u, p) => {
    const userToLogin = u || username;
    const passToLogin = p || password;
    if (!userToLogin || !passToLogin) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    try {
      const res = await api.login(userToLogin, passToLogin);
      setAuthToken(res.access_token);
      setOfficerUser(res);
      fetchQueue(res.access_token);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    }
  };

  const fetchQueue = async (token = authToken) => {
    if (!token) return;
    setQueueLoading(true);
    try {
      const res = await api.getOfficerQueue(token);
      setQueue(res);
    } catch (err) {
      Alert.alert('Queue Error', err.message);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedGrievance) return;
    setUpdatingStatus(true);
    try {
      const updated = await api.updateGrievanceStatus(
        selectedGrievance.id,
        newStatus,
        actionNote,
        authToken
      );
      setQueue(prev => prev.map(item => item.id === updated.id ? updated : item));
      setSelectedGrievance(null);
      setActionNote('');
      Alert.alert('Success', `Grievance status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ---------------- SETTINGS LOGIC ----------------
  const handleSaveServerUrl = () => {
    setApiBaseUrl(serverUrl);
    Alert.alert('Saved', `API Base URL updated to:\n${serverUrl}`);
  };

  const testServerConnection = async () => {
    setTestingConnection(true);
    try {
      const testUrl = serverUrl.replace(/\/api\/?$/, '');
      const res = await fetch(testUrl);
      const data = await res.json();
      Alert.alert('Success!', `Connected to:\n${data.system || 'FastAPI Server'}`);
    } catch (err) {
      Alert.alert('Connection Failed', `Cannot reach ${serverUrl}.\nCheck your Wi-Fi and server status.`);
    } finally {
      setTestingConnection(false);
    }
  };

  const categories = [
    { label: 'Auto-Detect (AI)', value: '' },
    { label: 'Water Supply', value: 'water' },
    { label: 'Roads & Traffic', value: 'road' },
    { label: 'Electricity', value: 'electricity' },
    { label: 'Sanitation', value: 'sanitation' },
    { label: 'Anti-Corruption', value: 'corruption' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerLogo}>🛡️ JanAwaaz AI</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Multi-Agent</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Anonymous Public Grievance Redressal</Text>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ================= TAB 1: SUBMIT ================= */}
        {activeTab === 'submit' && (
          <View>
            <View style={styles.privacyCard}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyTitle}>100% Anonymous & Private</Text>
                <Text style={styles.privacyText}>
                  IntakeAgent automatically scrubs your names, phone numbers, and email addresses via regex rules before processing.
                </Text>
              </View>
            </View>

            {submitResult ? (
              <View style={styles.successCard}>
                <Text style={styles.successTitle}>✅ Grievance Submitted!</Text>
                
                <View style={styles.trackingBox}>
                  <Text style={styles.trackingLabel}>YOUR ANONYMOUS TRACKING ID</Text>
                  <Text style={styles.trackingIdText}>{submitResult.tracking_id}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Department:</Text>
                  <Text style={styles.metaValue}>{submitResult.department_name}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Urgency Priority:</Text>
                  <Text style={[styles.metaValue, { color: submitResult.urgency_level === 'critical' ? '#ef4444' : '#10b981', fontWeight: 'bold' }]}>
                    {submitResult.urgency_level.toUpperCase()} ({(submitResult.urgency_score * 100).toFixed(0)}%)
                  </Text>
                </View>

                <View style={styles.sanitizedBox}>
                  <Text style={styles.sanitizedLabel}>Sanitized Text (PII Scrubbed):</Text>
                  <Text style={styles.sanitizedText}>"{submitResult.sanitized_text}"</Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    handleTrackGrievance(submitResult.tracking_id);
                    setActiveTab('track');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Track Resolution Progress ➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setSubmitResult(null)}
                >
                  <Text style={styles.secondaryBtnText}>File Another Grievance</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Describe the Public Issue</Text>

                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={5}
                  placeholder="e.g. Urgent sewage water pipe broken on 4th Main Street flooding the road. Contact me at 9876543210..."
                  placeholderTextColor="#64748b"
                  value={text}
                  onChangeText={setText}
                />
                <Text style={styles.charCount}>{text.length} characters</Text>

                <Text style={styles.inputLabel}>Category Hint (Optional)</Text>
                <View style={styles.categoryContainer}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.value}
                      style={[
                        styles.catChip,
                        categoryHint === c.value && styles.catChipActive
                      ]}
                      onPress={() => setCategoryHint(c.value)}
                    >
                      <Text style={[styles.catChipText, categoryHint === c.value && styles.catChipTextActive]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Photo & Video Attachment Options */}
                <Text style={styles.inputLabel}>Attach Photo / Video Proof (Optional)</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[styles.catChip, mediaUrl && styles.catChipActive, { flex: 1, alignItems: 'center' }]}
                    onPress={() => {
                      // Demo realistic photo evidence for civic hazard
                      setMediaUrl('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop');
                      setMediaType('image');
                    }}
                  >
                    <Text style={[styles.catChipText, mediaUrl && styles.catChipTextActive]}>
                      📸 {mediaUrl ? 'Photo Attached' : 'Attach Photo'}
                    </Text>
                  </TouchableOpacity>

                  {mediaUrl && (
                    <TouchableOpacity
                      style={[styles.catChip, { backgroundColor: '#7f1d1d', borderColor: '#ef4444' }]}
                      onPress={() => setMediaUrl(null)}
                    >
                      <Text style={{ color: '#fca5a5', fontSize: 12, fontWeight: 'bold' }}>✕ Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {mediaUrl && (
                  <View style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}>
                    <Image source={{ uri: mediaUrl }} style={{ width: '100%', height: 160, backgroundColor: '#000' }} resizeMode="cover" />
                    <Text style={{ padding: 6, backgroundColor: '#0f172a', color: '#10b981', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                      ✓ Photo evidence ready to submit with complaint
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.primaryBtn}
                  disabled={submitting}
                  onPress={handleSubmitGrievance}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Submit Anonymously 🚀</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 2: TRACK & BROWSE COMPLAINTS ================= */}
        {activeTab === 'track' && (
          <View>
            {/* Sub-Tabs: My Complaints | Browse All | Search */}
            <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', padding: 4, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }}>
              <TouchableOpacity
                style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 }, trackSubView === 'my' && { backgroundColor: '#10b981' }]}
                onPress={() => setTrackSubView('my')}
              >
                <Text style={{ color: trackSubView === 'my' ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
                  My Saved ({myComplaints.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 }, trackSubView === 'feed' && { backgroundColor: '#10b981' }]}
                onPress={() => {
                  setTrackSubView('feed');
                  handleFetchFeed();
                }}
              >
                <Text style={{ color: trackSubView === 'feed' ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
                  Browse All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 }, trackSubView === 'search' && { backgroundColor: '#10b981' }]}
                onPress={() => setTrackSubView('search')}
              >
                <Text style={{ color: trackSubView === 'search' ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
                  Search ID
                </Text>
              </TouchableOpacity>
            </View>

            {/* SUB-VIEW 1: MY SAVED COMPLAINTS IN APP */}
            {trackSubView === 'my' && (
              <View>
                {myComplaints.length === 0 ? (
                  <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>No complaints stored on device yet</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                      When you submit a complaint, it will be automatically stored in the app here so you never lose it.
                    </Text>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { paddingHorizontal: 20 }]}
                      onPress={() => {
                        setTrackSubView('feed');
                        handleFetchFeed();
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Browse All Stored Complaints ➔</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  myComplaints.map((item, idx) => (
                    <TouchableOpacity
                      key={item.tracking_id || idx}
                      style={[styles.card, { marginBottom: 12 }]}
                      onPress={() => handleTrackGrievance(item.tracking_id)}
                    >
                      <View style={styles.metaRow}>
                        <Text style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 13 }}>
                          {item.tracking_id}
                        </Text>
                        <View style={[styles.statusPill, { backgroundColor: item.status === 'resolved' ? '#065f46' : '#1e3a8a' }]}>
                          <Text style={styles.statusPillText}>{item.status ? item.status.toUpperCase() : 'SUBMITTED'}</Text>
                        </View>
                      </View>
                      <Text style={{ color: '#cbd5e1', fontSize: 13, marginVertical: 6 }} numberOfLines={2}>
                        {item.sanitized_text || item.text}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 11 }}>
                        Dept: {item.department_name} • Tap to view live tracking ➔
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* SUB-VIEW 2: BROWSE ALL STORED COMPLAINTS */}
            {trackSubView === 'feed' && (
              <View>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                  {['all', 'resolved', 'in_progress', 'submitted'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1e293b' },
                        feedFilter === st && { backgroundColor: '#10b981' }
                      ]}
                      onPress={() => setFeedFilter(st)}
                    >
                      <Text style={{ color: feedFilter === st ? '#fff' : '#94a3b8', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {st.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {feedLoading ? (
                  <View style={[styles.card, { paddingVertical: 30, alignItems: 'center' }]}>
                    <ActivityIndicator color="#10b981" />
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>Loading complaints from server...</Text>
                  </View>
                ) : publicFeed.length === 0 ? (
                  <View style={[styles.card, { paddingVertical: 20, alignItems: 'center' }]}>
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>No complaints found.</Text>
                  </View>
                ) : (
                  publicFeed.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.card, { marginBottom: 12 }]}
                      onPress={() => handleTrackGrievance(g.tracking_id)}
                    >
                      <View style={styles.metaRow}>
                        <Text style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 13 }}>
                          {g.tracking_id}
                        </Text>
                        <View style={[styles.statusPill, { backgroundColor: g.status === 'resolved' ? '#065f46' : '#1e3a8a' }]}>
                          <Text style={styles.statusPillText}>{g.status.toUpperCase()}</Text>
                        </View>
                      </View>

                      <Text style={{ color: '#f1f5f9', fontSize: 13, marginVertical: 6 }} numberOfLines={2}>
                        {g.sanitized_text}
                      </Text>

                      {/* Photo indicator */}
                      {g.media_url && (
                        <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600', marginBottom: 4 }}>
                          📸 Photo Evidence Attached
                        </Text>
                      )}

                      {/* Resolved preview */}
                      {g.status === 'resolved' && (
                        <View style={{ backgroundColor: '#022c22', padding: 8, borderRadius: 6, marginVertical: 4, borderWidth: 1, borderColor: '#059669' }}>
                          <Text style={{ color: '#6ee7b7', fontSize: 11, fontWeight: 'bold' }}>
                            ✓ Resolved by: {g.resolved_by || 'Officer'}
                          </Text>
                          {g.resolution_note && (
                            <Text style={{ color: '#cbd5e1', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>
                              "{g.resolution_note}"
                            </Text>
                          )}
                        </View>
                      )}

                      <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                        {g.department_name} • Filed: {new Date(g.created_at).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* SUB-VIEW 3: SEARCH BY TRACKING ID */}
            {trackSubView === 'search' && (
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Enter Tracking ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. AGY-9259-82F5-1F66"
                  placeholderTextColor="#64748b"
                  autoCapitalize="characters"
                  value={trackingIdInput}
                  onChangeText={setTrackingIdInput}
                />
                <TouchableOpacity
                  style={styles.primaryBtn}
                  disabled={trackingLoading}
                  onPress={() => handleTrackGrievance()}
                >
                  {trackingLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Check Live Status 🔍</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* DETAILED GRIEVANCE VIEW */}
            {trackingData && (
              <View style={[styles.card, { marginTop: 12 }]}>
                <View style={styles.metaRow}>
                  <Text style={styles.cardHeading}>{trackingData.department_name}</Text>
                  <View style={[styles.statusPill, { backgroundColor: trackingData.status === 'resolved' ? '#065f46' : '#1e3a8a' }]}>
                    <Text style={styles.statusPillText}>{trackingData.status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* RESOLVED BY OFFICER PROMINENT BANNER */}
                {trackingData.status === 'resolved' && (
                  <View style={{ backgroundColor: '#022c22', borderWidth: 2, borderColor: '#10b981', borderRadius: 12, padding: 14, marginVertical: 12 }}>
                    <Text style={{ color: '#10b981', fontSize: 15, fontWeight: 'bold', marginBottom: 4 }}>
                      ✅ Resolved by Department Officer
                    </Text>
                    <Text style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '600' }}>
                      Officer: {trackingData.resolved_by || 'Assigned Officer'}
                    </Text>
                    {trackingData.resolved_at && (
                      <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                        Completed: {new Date(trackingData.resolved_at).toLocaleString()}
                      </Text>
                    )}
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#064e3b' }}>
                      <Text style={{ color: '#a7f3d0', fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>
                        OFFICER RESOLUTION REPORT:
                      </Text>
                      <Text style={{ color: '#f8fafc', fontSize: 12, fontStyle: 'italic', lineHeight: 18 }}>
                        "{trackingData.resolution_note || 'Issue inspected on-site by the maintenance team and work has been completed.'}"
                      </Text>
                    </View>
                  </View>
                )}

                {/* Grievance Text */}
                <View style={styles.sanitizedBox}>
                  <Text style={styles.sanitizedLabel}>Sanitized Complaint Description:</Text>
                  <Text style={styles.sanitizedText}>"{trackingData.sanitized_text}"</Text>
                </View>

                {/* Photo Evidence if attached */}
                {trackingData.media_url && (
                  <View style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}>
                    <Image source={{ uri: trackingData.media_url }} style={{ width: '100%', height: 180, backgroundColor: '#000' }} resizeMode="contain" />
                    <Text style={{ padding: 6, backgroundColor: '#0f172a', color: '#10b981', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                      📸 Attached Photo Evidence
                    </Text>
                  </View>
                )}

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Resolution Timeline & Action History:</Text>
                {trackingData.status_logs && trackingData.status_logs.length > 0 ? (
                  trackingData.status_logs.map((log, i) => (
                    <View key={log.id || i} style={styles.timelineItem}>
                      <Text style={styles.timelineStatus}>
                        ● [{log.new_status.toUpperCase()}]
                        {log.changed_by_username ? ` by ${log.changed_by_username}` : ''}
                      </Text>
                      {log.note && <Text style={styles.timelineNote}>{log.note}</Text>}
                      <Text style={styles.timelineDate}>{new Date(log.timestamp).toLocaleString()}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 12 }}>No logs yet</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 3: OFFICER QUEUE ================= */}
        {activeTab === 'officer' && (
          <View>
            {!authToken ? (
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Officer & Admin Login</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={setUsername}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => handleLogin()}
                >
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                </TouchableOpacity>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Quick 1-Tap Demo Logins:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => handleLogin('officer_water', 'officer123')}
                  >
                    <Text style={styles.demoBtnText}>Water Officer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => handleLogin('officer_road', 'officer123')}
                  >
                    <Text style={styles.demoBtnText}>Road Officer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => handleLogin('admin', 'admin123')}
                  >
                    <Text style={styles.demoBtnText}>System Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                  <View>
                    <Text style={styles.cardHeading}>{officerUser?.username}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>
                      {officerUser?.role === 'admin' ? 'Administrator' : officerUser?.department_name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => {
                      setAuthToken(null);
                      setOfficerUser(null);
                    }}
                  >
                    <Text style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: 12 }}>Logout</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: 15 }}>
                    Queue ({queue.length})
                  </Text>
                  <TouchableOpacity onPress={() => fetchQueue()}>
                    <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}>🔄 Refresh</Text>
                  </TouchableOpacity>
                </View>

                {queueLoading ? (
                  <ActivityIndicator color="#10b981" style={{ marginTop: 20 }} />
                ) : queue.length === 0 ? (
                  <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>No grievances in queue</Text>
                ) : (
                  queue.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.queueCard}
                      onPress={() => {
                        setSelectedGrievance(item);
                        setNewStatus(item.status);
                      }}
                    >
                      <View style={styles.metaRow}>
                        <Text style={styles.queueId}>{item.tracking_id}</Text>
                        <View style={[styles.urgencyBadge, { backgroundColor: item.urgency_level === 'critical' ? '#7f1d1d' : '#334155' }]}>
                          <Text style={styles.urgencyText}>{item.urgency_level.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.queueText} numberOfLines={2}>{item.sanitized_text}</Text>
                      <View style={[styles.metaRow, { marginTop: 8 }]}>
                        <Text style={{ color: '#10b981', fontSize: 11 }}>Status: {item.status.toUpperCase()}</Text>
                        <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: 'bold' }}>Tap to Action ➔</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 4: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>⚙️ Backend Connection Settings</Text>
            <Text style={styles.privacyText}>
              Ensure your phone and PC are connected to the same Wi-Fi.
            </Text>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Backend API URL:</Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://10.42.217.217:8000/api"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />

            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => setServerUrl('http://10.42.217.217:8000/api')}
              >
                <Text style={styles.demoBtnText}>PC Wi-Fi IP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => setServerUrl('http://10.0.2.2:8000/api')}
              >
                <Text style={styles.demoBtnText}>Android Emulator</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveServerUrl}
            >
              <Text style={styles.primaryBtnText}>Save Server URL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { marginTop: 8 }]}
              onPress={testServerConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <ActivityIndicator color="#10b981" />
              ) : (
                <Text style={styles.secondaryBtnText}>Test Server Connection 📶</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ================= MODAL: OFFICER ACTION ================= */}
      {selectedGrievance && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedGrievance(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.cardHeading}>Update Grievance #{selectedGrievance.id}</Text>
              <Text style={{ color: '#10b981', fontSize: 12, marginBottom: 8 }}>
                {selectedGrievance.tracking_id}
              </Text>

              <Text style={styles.sanitizedText} numberOfLines={3}>
                "{selectedGrievance.sanitized_text}"
              </Text>

              {/* Citizen Evidence Preview for Officer */}
              {selectedGrievance.media_url && (
                <View style={{ marginVertical: 8, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}>
                  <Image source={{ uri: selectedGrievance.media_url }} style={{ width: '100%', height: 120, backgroundColor: '#000' }} resizeMode="contain" />
                  <Text style={{ padding: 4, backgroundColor: '#0f172a', color: '#10b981', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
                    📸 Citizen Uploaded Evidence Attached
                  </Text>
                </View>
              )}

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Change Status to:</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
                {['in_progress', 'resolved', 'rejected'].map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.catChip, newStatus === st && styles.catChipActive]}
                    onPress={() => setNewStatus(st)}
                  >
                    <Text style={[styles.catChipText, newStatus === st && styles.catChipTextActive]}>
                      {st.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 8 }]}>
                {newStatus === 'resolved' ? 'Official Resolution Report (Shown to Citizen):' : 'Officer Audit Note:'}
              </Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder={newStatus === 'resolved' ? 'e.g. Inspected on-site. Electrical wire repaired and verified safe.' : 'e.g. Dispatched maintenance team to location...'}
                placeholderTextColor="#64748b"
                multiline
                value={actionNote}
                onChangeText={setActionNote}
              />

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { flex: 1 }]}
                  onPress={() => setSelectedGrievance(null)}
                >
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  disabled={updatingStatus}
                  onPress={handleUpdateStatus}
                >
                  {updatingStatus ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Save Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('submit')}
        >
          <Text style={[styles.tabIcon, activeTab === 'submit' && styles.tabActive]}>📝</Text>
          <Text style={[styles.tabLabel, activeTab === 'submit' && styles.tabLabelActive]}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('track')}
        >
          <Text style={[styles.tabIcon, activeTab === 'track' && styles.tabActive]}>🔍</Text>
          <Text style={[styles.tabLabel, activeTab === 'track' && styles.tabLabelActive]}>Track</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('officer')}
        >
          <Text style={[styles.tabIcon, activeTab === 'officer' && styles.tabActive]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'officer' && styles.tabLabelActive]}>Officer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>Server</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#020617'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc'
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  badgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold'
  },
  headerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 10
  },
  privacyIcon: {
    fontSize: 20
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 2
  },
  privacyText: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16
  },
  textArea: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 13,
    minHeight: 110
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    padding: 12,
    fontSize: 13,
    marginBottom: 10
  },
  charCount: {
    textAlign: 'right',
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginBottom: 8
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  catChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  catChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981'
  },
  catChipText: {
    color: '#94a3b8',
    fontSize: 11
  },
  catChipTextActive: {
    color: '#10b981',
    fontWeight: 'bold'
  },
  primaryBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryBtnText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 14
  },
  secondaryBtn: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  secondaryBtnText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13
  },
  successCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981'
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 14
  },
  trackingBox: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    alignItems: 'center',
    marginBottom: 14
  },
  trackingLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
    letterSpacing: 1
  },
  trackingIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 4,
    letterSpacing: 1
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: 12
  },
  metaValue: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600'
  },
  sanitizedBox: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10
  },
  sanitizedLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4
  },
  sanitizedText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic'
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  timelineItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#10b981',
    paddingLeft: 10,
    marginVertical: 6
  },
  timelineStatus: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 'bold'
  },
  timelineNote: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 2
  },
  timelineDate: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2
  },
  demoBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  demoBtnText: {
    color: '#38bdf8',
    fontSize: 11
  },
  logoutBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  queueCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10
  },
  queueId: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 13
  },
  queueText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4
  },
  urgencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  urgencyText: {
    color: '#fca5a5',
    fontSize: 10,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6
  },
  tabActive: {
    opacity: 1
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  tabLabelActive: {
    color: '#10b981',
    fontWeight: 'bold'
  }
});
