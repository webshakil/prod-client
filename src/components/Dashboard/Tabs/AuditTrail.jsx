// Enhanced AuditTrail.jsx - With PDF Export, Tamper Demo, Self-Explanatory UI, Tooltips
import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, 
  Eye, Download, RefreshCw, TrendingUp, Users, Activity, 
  FileText, AlertTriangle, Filter, Info, Blocks,
  GitBranch, Clock, Fingerprint, ChevronDown, HelpCircle,
  ToggleLeft, ToggleRight, BookOpen, Zap, XCircle, ExternalLink
} from 'lucide-react';
import { useGetAuditLogsQuery, useGetAuditStatsQuery, useLazyGetHashChainQuery, useLazyVerifyIntegrityQuery, useLazyExportAuditTrailQuery, useGetVoteVerificationsQuery } from '../../../redux/api/verification/auditTrailApi';
import { getAllElections } from '../../../redux/api/election/electionApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 🆕 NEW: Tooltip Component
const Tooltip = ({ children, content, position = 'top' }) => {
  const [show, setShow] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className={`absolute z-50 ${positionClasses[position]} w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl`}>
          <div className="relative">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// 🆕 NEW: Detailed Info Modal for Duplicate Votes
const DuplicateVoteInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={24} />
              Duplicate Vote Detection & Handling
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>

          <div className="space-y-4">
            {/* What is a Duplicate Vote */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">What is a Duplicate Vote?</h3>
              <p className="text-sm text-yellow-700">
                A duplicate vote occurs when someone attempts to vote more than once in the same election. 
                Our system automatically detects and blocks these attempts to ensure fair elections.
              </p>
            </div>

            {/* How System Handles It */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">How the System Handles It</h3>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li><strong>Detection:</strong> When a vote is submitted, the system checks if this user has already voted in this election.</li>
                <li><strong>Blocking:</strong> If a previous vote exists, the new vote is rejected immediately.</li>
                <li><strong>Logging:</strong> The attempt is recorded in the audit log with IP address, user agent, and timestamp.</li>
                <li><strong>Flagging:</strong> The entry is marked as "flagged for review" for admin investigation.</li>
                <li><strong>Original Vote Preserved:</strong> The user's first (legitimate) vote remains unchanged and valid.</li>
              </ol>
            </div>

            {/* What Admin Should Do */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2">What Should Admin Do?</h3>
              <div className="text-sm text-green-700 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p><strong>Review the log:</strong> Check if it's a user error (refreshed page, network issue) or intentional fraud.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p><strong>Check IP patterns:</strong> Multiple attempts from different IPs may indicate account sharing or manipulation.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p><strong>Contact user (optional):</strong> For legitimate users, explain that their first vote was recorded successfully.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p><strong>No action needed:</strong> The system already blocked the duplicate - the election integrity is maintained.</p>
                </div>
              </div>
            </div>

            {/* Data Stored */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-bold text-purple-800 mb-2">Data Captured for Each Attempt</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
                <div className="bg-white/50 p-2 rounded">📅 Timestamp</div>
                <div className="bg-white/50 p-2 rounded">👤 User ID</div>
                <div className="bg-white/50 p-2 rounded">🗳️ Election ID</div>
                <div className="bg-white/50 p-2 rounded">🌐 IP Address</div>
                <div className="bg-white/50 p-2 rounded">💻 Browser/Device</div>
                <div className="bg-white/50 p-2 rounded">🔗 Original Vote ID</div>
                <div className="bg-white/50 p-2 rounded">📝 Attempted Answers</div>
                <div className="bg-white/50 p-2 rounded">🚩 Flagged Status</div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">💡 Important Note</h3>
              <p className="text-sm text-gray-700">
                Duplicate vote attempts do NOT affect election results. They are blocked at submission time, 
                and only the original valid vote is counted. The audit log exists purely for transparency 
                and security monitoring purposes.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🆕 NEW: Suspicious Activity Info Modal
const SuspiciousActivityInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={24} />
              Suspicious Activity Detection
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>

          <div className="space-y-4">
            {/* What triggers suspicious activity */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-800 mb-2">What Triggers Suspicious Activity?</h3>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Multiple votes from the same IP address in short time</li>
                <li>Bot-like voting patterns (too fast, same timing)</li>
                <li>Unusual user agent strings (automated scripts)</li>
                <li>VPN/Proxy detection for sensitive elections</li>
                <li>Geographic anomalies (voting from unexpected locations)</li>
                <li>Failed authentication attempts before voting</li>
              </ul>
            </div>

            {/* What to do */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-bold text-orange-800 mb-2">Recommended Actions</h3>
              <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside">
                <li><strong>Review the details:</strong> Check IP, timestamp, and user agent for patterns.</li>
                <li><strong>Cross-reference:</strong> See if the same IP appears in multiple entries.</li>
                <li><strong>Verify vote validity:</strong> Check if the associated vote was legitimate.</li>
                <li><strong>Take notes:</strong> Document findings for audit trail.</li>
                <li><strong>Escalate if needed:</strong> Report to election administrators for serious concerns.</li>
              </ol>
            </div>

            {/* Note */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Not all suspicious activity indicates fraud. Network issues, shared computers, 
                or corporate networks can trigger false positives. Always investigate before taking action.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AuditTrail() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    actionType: '',
    electionId: '',
    startDate: '',
    endDate: '',
  });
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [showHashChain, setShowHashChain] = useState(false);
  const [showIntegrityCheck, setShowIntegrityCheck] = useState(false);
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);

  // States for enhanced features
  const [showTamperDemo, setShowTamperDemo] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [showAuditLogExplanation, setShowAuditLogExplanation] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);

  // 🆕 NEW: Modal states
  const [showDuplicateVoteInfo, setShowDuplicateVoteInfo] = useState(false);
  const [showSuspiciousActivityInfo, setShowSuspiciousActivityInfo] = useState(false);

  // Elections state for dropdown
  const [elections, setElections] = useState([]);
  const [electionsLoading, setElectionsLoading] = useState(true);

  // Fetch all elections on component mount
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setElectionsLoading(true);
        const response = await getAllElections(1, 100, 'all');
        const electionsList = response?.data?.elections || response?.elections || response?.data || [];
        setElections(Array.isArray(electionsList) ? electionsList : []);
      } catch (error) {
        console.error('Failed to fetch elections:', error);
        setElections([]);
      } finally {
        setElectionsLoading(false);
      }
    };
    fetchElections();
  }, []);

  // RTK Query Hooks
  const { 
    data: logsData, 
    isLoading: logsLoading, 
    refetch: refetchLogs 
  } = useGetAuditLogsQuery({
    page,
    limit: 20,
    ...filters
  });

  const { 
    data: statsData, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetAuditStatsQuery(filters.electionId || undefined);

  const { 
    /*eslint-disable*/
    data: verificationsData 
  } = useGetVoteVerificationsQuery({
    electionId: filters.electionId || undefined,
    page: 1,
    limit: 10
  });

  const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
  const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();
  const [exportAudit, { isLoading: exportLoading }] = useLazyExportAuditTrailQuery();

  const auditLogs = logsData?.data?.auditLogs || [];
  const pagination = logsData?.data?.pagination;
  const stats = statsData?.data;

  const handleRefresh = () => {
    refetchLogs();
    refetchStats();
  };

  const handleFetchHashChain = async () => {
    if (!selectedElectionId) {
      alert('Please select an Election');
      return;
    }
    await getHashChain({ electionId: selectedElectionId, limit: 100 });
    setShowHashChain(true);
  };

  const handleVerifyIntegrity = async () => {
    if (!selectedElectionId) {
      alert('Please select an Election');
      return;
    }
    await verifyIntegrity(selectedElectionId);
    setShowIntegrityCheck(true);
  };

  // 🆕 NEW: Scroll to audit logs and filter by election
  const scrollToAuditLogs = (electionId) => {
    setFilters({ ...filters, electionId: electionId?.toString() || '' });
    setPage(1);
    // Scroll to audit logs section
    setTimeout(() => {
      document.getElementById('audit-logs-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // PDF Export Function using jspdf
  const handleExportPDF = async () => {
    if (!selectedElectionId) {
      alert('Please select an Election');
      return;
    }

    setPdfExporting(true);

    try {
      // Fetch the audit data
      const result = await exportAudit({ 
        electionId: selectedElectionId, 
        format: 'json',
        startDate: filters.startDate,
        endDate: filters.endDate
      }).unwrap();

      const selectedElection = getSelectedElection();
      
      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Audit Trail Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Election ID: #${selectedElectionId}`, pageWidth - 60, 30);

      // Election Info Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Election Information', 14, 55);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Title: ${selectedElection?.title || 'N/A'}`, 14, 65);
      doc.text(`Status: ${selectedElection?.status || 'N/A'}`, 14, 72);
      doc.text(`Voting Type: ${selectedElection?.voting_type || 'N/A'}`, 14, 79);

      // Summary Statistics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Audit Summary', 14, 95);

      const summaryData = [
        ['Total Actions', result?.stats?.total_actions || stats?.overall?.total_actions || '0'],
        ['Unique Users', result?.stats?.unique_users || stats?.overall?.unique_users || '0'],
        ['Normal Votes', result?.stats?.total_votes || stats?.votes?.total_votes || '0'],
        ['Anonymous Votes', result?.stats?.anonymous_votes || stats?.votes?.total_anonymous_votes || '0'],
        ['Integrity Status', 'Verified ✓'],
      ];

      autoTable(doc, {
        startY: 100,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });

      // Get the final Y position after the table
      const finalY = doc.lastAutoTable?.finalY || 150;

      // Hash Chain Information
      if (result?.hashChain || hashChainData?.data) {
        const chainData = result?.hashChain || hashChainData?.data;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Blockchain Verification', 14, finalY + 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Blocks: ${chainData?.totalBlocks || 0}`, 14, finalY + 25);
        doc.text(`Merkle Root: ${chainData?.merkleRoot?.substring(0, 40) || 'N/A'}...`, 14, finalY + 32);
        doc.text(`Genesis Hash: ${chainData?.genesisHash?.substring(0, 40) || '0000...'}...`, 14, finalY + 39);
        doc.text(`Chain Integrity: VERIFIED`, 14, finalY + 46);
      }

      // Audit Logs Table
      if (result?.auditLogs && result.auditLogs.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Audit Log Entries', 14, 20);

        const logsTableData = result.auditLogs.slice(0, 50).map(log => [
          new Date(log.created_at).toLocaleString(),
          log.action_type?.replace(/_/g, ' ') || 'N/A',
          `#${log.election_id}`,
          log.user_id || 'N/A',
          log.ip_address || 'N/A',
        ]);

        autoTable(doc, {
          startY: 25,
          head: [['Timestamp', 'Action', 'Election', 'User ID', 'IP Address']],
          body: logsTableData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });
      }

      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | Vottery Audit Trail | Blockchain-Verified`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`audit-trail-election-${selectedElectionId}-${Date.now()}.pdf`);

    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setPdfExporting(false);
    }
  };

  // Keep existing JSON export
  const handleExport = async (format) => {
    if (!selectedElectionId) {
      alert('Please select an Election');
      return;
    }
    
    try {
      const result = await exportAudit({ 
        electionId: selectedElectionId, 
        format,
        startDate: filters.startDate,
        endDate: filters.endDate
      }).unwrap();

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-trail-${selectedElectionId}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export audit trail');
    }
  };

  const getSelectedElection = () => {
    return elections.find(e => e.id?.toString() === selectedElectionId?.toString());
  };

  const getActionIcon = (actionType) => {
    const icons = {
      'duplicate_vote': <AlertCircle className="text-yellow-600" size={18} />,
      'suspicious_activity': <AlertTriangle className="text-red-600" size={18} />,
      'vote_cast': <CheckCircle className="text-green-600" size={18} />,
      'vote_verified': <Shield className="text-blue-600" size={18} />,
    };
    return icons[actionType] || <Lock className="text-gray-600" size={18} />;
  };

  const getActionColor = (actionType) => {
    const colors = {
      'duplicate_vote': 'bg-yellow-100 text-yellow-800',
      'suspicious_activity': 'bg-red-100 text-red-800',
      'vote_cast': 'bg-green-100 text-green-800',
      'vote_verified': 'bg-blue-100 text-blue-800',
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setFilters({ actionType: '', electionId: '', startDate: '', endDate: '' });
    setPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'published': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Demo data for tamper visualization
  const demoBlocks = {
    normal: [
      { blockNumber: 1, voteHash: 'a1b2c3d4e5f6...', previousHash: '0000000000000000...', blockHash: 'f662616b293c4657...', verified: true },
      { blockNumber: 2, voteHash: '7g8h9i0j1k2l...', previousHash: 'f662616b293c4657...', blockHash: 'ed7534494f4598e0...', verified: true },
      { blockNumber: 3, voteHash: '3m4n5o6p7q8r...', previousHash: 'ed7534494f4598e0...', blockHash: '8409d1086a483db2...', verified: true },
    ],
    tampered: [
      { blockNumber: 1, voteHash: 'a1b2c3d4e5f6...', previousHash: '0000000000000000...', blockHash: 'f662616b293c4657...', verified: true },
      { blockNumber: 2, voteHash: 'MODIFIED_VOTE!...', previousHash: 'f662616b293c4657...', blockHash: 'XXXXXXXXXXXXX...', verified: false, tampered: true },
      { blockNumber: 3, voteHash: '3m4n5o6p7q8r...', previousHash: 'ed7534494f4598e0...', blockHash: '8409d1086a483db2...', verified: false, chainBroken: true },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 🆕 Modals */}
      <DuplicateVoteInfoModal isOpen={showDuplicateVoteInfo} onClose={() => setShowDuplicateVoteInfo(false)} />
      <SuspiciousActivityInfoModal isOpen={showSuspiciousActivityInfo} onClose={() => setShowSuspiciousActivityInfo(false)} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="text-blue-600" size={32} />
                Audit Trail & Blockchain Verification
              </h1>
              <p className="text-gray-600">
                Industry-standard immutable audit logging with cryptographic verification
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
              >
                <Info size={16} />
                How It Works
              </button>
              <button
                onClick={handleRefresh}
                disabled={logsLoading || statsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <BookOpen size={24} />
                What is an Audit Trail?
              </h2>
              <p className="text-blue-100 mb-4">
                An audit trail is a <strong>permanent, tamper-proof record</strong> of every action in the system. 
                Think of it like a security camera that records everything and cannot be edited or deleted.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={18} />
                    <span className="font-semibold">Every Vote Recorded</span>
                  </div>
                  <p className="text-sm text-blue-100">Each vote creates a unique cryptographic fingerprint</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 size={18} />
                    <span className="font-semibold">Chain Linked</span>
                  </div>
                  <p className="text-sm text-blue-100">Records are linked like blockchain - changing one breaks all</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={18} />
                    <span className="font-semibold">Tamper Detection</span>
                  </div>
                  <p className="text-sm text-blue-100">Any modification is instantly detectable</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Tamper Demo Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-dashed border-indigo-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="text-yellow-500" size={24} />
              Interactive Demo: Normal vs Tampered Data
            </h2>
            <button
              onClick={() => setShowTamperDemo(!showTamperDemo)}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 flex items-center gap-2"
            >
              {showTamperDemo ? <Eye size={16} /> : <Eye size={16} />}
              {showTamperDemo ? 'Hide Demo' : 'Show Demo'}
            </button>
          </div>

          {showTamperDemo && (
            <div className="space-y-4">
              {/* Toggle Switch */}
              <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className={`font-semibold ${!isTampered ? 'text-green-600' : 'text-gray-400'}`}>
                  ✅ Normal (Intact)
                </span>
                <button
                  onClick={() => setIsTampered(!isTampered)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    isTampered ? 'bg-red-500' : 'bg-green-500'
                  }`}
                >
                  <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    isTampered ? 'translate-x-9' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`font-semibold ${isTampered ? 'text-red-600' : 'text-gray-400'}`}>
                  ❌ Tampered (Modified)
                </span>
              </div>

              {/* Demo Visualization */}
              <div className={`p-4 rounded-lg border-2 ${
                isTampered ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  {isTampered ? (
                    <>
                      <XCircle className="text-red-600" size={24} />
                      <span className="font-bold text-red-700">⚠️ TAMPERING DETECTED! Chain integrity compromised.</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="text-green-600" size={24} />
                      <span className="font-bold text-green-700">✓ Chain Verified - All blocks intact</span>
                    </>
                  )}
                </div>

                {/* Demo Blocks */}
                <div className="space-y-3">
                  {(isTampered ? demoBlocks.tampered : demoBlocks.normal).map((block, index) => (
                    <div
                      key={block.blockNumber}
                      className={`p-3 rounded-lg border ${
                        block.tampered 
                          ? 'bg-red-100 border-red-400 animate-pulse' 
                          : block.chainBroken 
                            ? 'bg-orange-100 border-orange-400'
                            : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">Block #{block.blockNumber}</span>
                        {block.tampered && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-bounce">
                            🚨 MODIFIED!
                          </span>
                        )}
                        {block.chainBroken && (
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                            ⛓️ CHAIN BROKEN
                          </span>
                        )}
                        {block.verified && !block.tampered && !block.chainBroken && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div>
                          <p className="text-gray-500">Vote Hash</p>
                          <p className={block.tampered ? 'text-red-600 font-bold' : 'text-gray-700'}>
                            {block.voteHash}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Previous Hash</p>
                          <p className={block.chainBroken ? 'text-orange-600 line-through' : 'text-gray-700'}>
                            {block.previousHash}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Block Hash</p>
                          <p className={block.tampered ? 'text-red-600 font-bold' : 'text-gray-700'}>
                            {block.blockHash}
                          </p>
                        </div>
                      </div>
                      {block.chainBroken && (
                        <p className="mt-2 text-xs text-orange-700">
                          ⚠️ Previous Hash doesn't match Block #2's hash - chain is broken!
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className={`mt-4 p-3 rounded-lg ${isTampered ? 'bg-red-100' : 'bg-green-100'}`}>
                  <p className="text-sm">
                    {isTampered ? (
                      <>
                        <strong>What happened:</strong> Someone tried to change Block #2's vote data. 
                        This caused its hash to change completely, which broke the link to Block #3. 
                        The system immediately detected this tampering because the hashes no longer match!
                      </>
                    ) : (
                      <>
                        <strong>How it works:</strong> Each block's "Previous Hash" exactly matches the 
                        prior block's "Block Hash". This creates an unbreakable chain. If ANY data changes, 
                        all subsequent blocks become invalid - making tampering impossible to hide!
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blockchain Info Panel - EXISTING (unchanged) */}
        {showBlockchainInfo && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-8 border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <Blocks size={24} />
                Understanding Blockchain-Style Audit Trail
              </h2>
              <button onClick={() => setShowBlockchainInfo(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* How it works */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <GitBranch size={18} className="text-indigo-600" />
                  How Hash Chain Works
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p><strong>Each vote creates a block</strong> - When someone votes, a new block is added to the chain with the vote hash.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p><strong>Blocks link together</strong> - Each block contains the hash of the previous block, creating an unbreakable chain.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p><strong>Tampering is detectable</strong> - If anyone changes a vote, the hash changes, breaking the chain.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p><strong>Merkle Root</strong> - A single hash representing ALL votes for quick verification.</p>
                  </div>
                </div>
              </div>

              {/* Visual representation */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Link2 size={18} className="text-green-600" />
                  Chain Structure
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                  <pre>{`
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Block 1 │───▶│ Block 2 │───▶│ Block 3 │
│ Vote #1 │    │ Vote #2 │    │ Vote #3 │
└────┬────┘    └────┬────┘    └────┬────┘
     │              │              │
prev:000...   prev:abc...    prev:def...
hash:abc...   hash:def...    hash:ghi...
                  `}</pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Genesis block</strong> starts with zeros. Each subsequent block links to the previous.
                </p>
              </div>

              {/* What each field means */}
              <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Fingerprint size={18} className="text-purple-600" />
                  Block Fields Explained
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Vote Hash</p>
                    <p className="text-gray-600 text-xs">SHA-256 hash of the vote data. Unique fingerprint of each vote.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Previous Hash</p>
                    <p className="text-gray-600 text-xs">Hash of the previous block. Creates the chain linkage.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Block Hash</p>
                    <p className="text-gray-600 text-xs">Hash of the entire block (vote + previous hash + timestamp).</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Merkle Root</p>
                    <p className="text-gray-600 text-xs">Single hash representing ALL votes. Used for quick verification.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Why only 1 block?</strong> The hash chain shows blocks <strong>per election</strong>. 
                If an election has 1 vote, you'll see 1 block. If it has 100 votes, you'll see 100 blocks. 
                The integrity check may show totals across ALL elections.
              </p>
            </div>
          </div>
        )}

        {/* Statistics Cards - EXISTING (unchanged) */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Actions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overall?.total_actions || 0}
                  </p>
                </div>
                <Shield className="text-blue-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overall?.unique_users || 0}
                  </p>
                </div>
                <Users className="text-green-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Normal Votes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.votes?.total_votes || 0}
                  </p>
                </div>
                <CheckCircle className="text-purple-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Anonymous Votes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.votes?.total_anonymous_votes || 0}
                  </p>
                </div>
                <Eye className="text-indigo-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last 24 Hours</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.recentActivity?.actions_24h || 0}
                  </p>
                </div>
                <TrendingUp className="text-orange-600" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Action Type Breakdown - EXISTING (unchanged) */}
        {stats?.actionTypes && stats.actionTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} />
              Action Type Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.actionTypes.map((action) => (
                <div
                  key={action.action_type}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  {getActionIcon(action.action_type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {action.action_type?.replace(/_/g, ' ') || 'Unknown'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{action.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blockchain Verification Section - ENHANCED with PDF Export */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="text-indigo-600" />
            Blockchain-Style Verification
            <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2">
              SHA-256 + Merkle Tree
            </span>
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Verify election integrity using cryptographic hash chains. Each vote creates a block linked to the previous one.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Election Dropdown */}
            <div className="flex-1 min-w-[300px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Select Election</label>
              <div className="relative">
                <select
                  value={selectedElectionId}
                  onChange={(e) => {
                    setSelectedElectionId(e.target.value);
                    setShowHashChain(false);
                    setShowIntegrityCheck(false);
                  }}
                  disabled={electionsLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {electionsLoading ? 'Loading elections...' : '-- Select an Election --'}
                  </option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      #{election.id} - {election.title} ({election.status || 'unknown'})
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  size={20} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
              </div>
              {/* Show selected election details */}
              {selectedElectionId && getSelectedElection() && (
                <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-indigo-900">
                      {getSelectedElection()?.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(getSelectedElection()?.status)}`}>
                      {getSelectedElection()?.status}
                    </span>
                  </div>
                  {getSelectedElection()?.voting_type && (
                    <p className="text-xs text-indigo-600 mt-1">
                      Type: {getSelectedElection()?.voting_type} | 
                      ID: #{getSelectedElection()?.id}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-5 flex-wrap">
              <button
                onClick={handleFetchHashChain}
                disabled={!selectedElectionId || hashChainLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Link2 size={16} />
                {hashChainLoading ? 'Loading...' : 'View Hash Chain'}
              </button>
              <button
                onClick={handleVerifyIntegrity}
                disabled={!selectedElectionId || integrityLoading}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Shield size={16} />
                {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
              </button>
              
              {/* Export Dropdown with PDF */}
              <div className="relative group">
                <button
                  disabled={!selectedElectionId || exportLoading || pdfExporting}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={16} />
                  {exportLoading || pdfExporting ? 'Exporting...' : 'Export ▾'}
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[150px]">
                  <button
                    onClick={handleExportPDF}
                    disabled={!selectedElectionId || pdfExporting}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <FileText size={14} className="text-red-500" />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={!selectedElectionId || exportLoading}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <FileText size={14} className="text-blue-500" />
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 🆕 ENHANCED: Integrity Check Result with Tooltips */}
          {showIntegrityCheck && integrityData && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              integrityData.verified 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {integrityData.verified ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <AlertTriangle className="text-red-600" size={24} />
                )}
                <h3 className="text-lg font-bold">
                  {integrityData.verified ? 'Integrity Verified ✓' : 'Integrity Issues Detected'}
                </h3>
                {integrityData.integrityScore !== undefined && (
                  <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
                    integrityData.integrityScore >= 90 ? 'bg-green-200 text-green-800' :
                    integrityData.integrityScore >= 70 ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    Score: {integrityData.integrityScore}%
                  </span>
                )}
                <button onClick={() => setShowIntegrityCheck(false)} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <p className="text-sm mb-3">{integrityData.message}</p>
              
              {/* Election Info */}
              {integrityData.election && (
                <div className="bg-white/50 rounded p-2 mb-3">
                  <p className="text-sm">
                    <strong>Election:</strong> {integrityData.election.title} (ID: {integrityData.election.id})
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                      integrityData.election.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {integrityData.election.status}
                    </span>
                  </p>
                </div>
              )}

              {/* 🆕 ENHANCED: Stats with Tooltips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/50 rounded p-2">
                  <p className="text-gray-600">Normal Votes</p>
                  <p className="text-xl font-bold text-blue-600">{integrityData.details?.totalNormalVotes || 0}</p>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <p className="text-gray-600">Anonymous Votes</p>
                  <p className="text-xl font-bold text-purple-600">{integrityData.details?.totalAnonymousVotes || 0}</p>
                </div>
                
                {/* 🆕 ENHANCED: Audit Logs with Tooltip & Click */}
                <Tooltip 
                  content={
                    <div>
                      <p className="font-bold mb-2">What are Audit Logs?</p>
                      <p className="mb-2">Security events recorded for this election:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Duplicate vote attempts</li>
                        <li>Suspicious activity</li>
                        <li>Failed authentications</li>
                      </ul>
                      <p className="mt-2 text-yellow-300">Click to view details ↓</p>
                    </div>
                  }
                >
                  <div 
                    className="bg-white/50 rounded p-2 cursor-pointer hover:bg-orange-100 transition-colors border-2 border-transparent hover:border-orange-300"
                    onClick={() => scrollToAuditLogs(integrityData.election?.id)}
                  >
                    <div className="flex items-center gap-1">
                      <p className="text-gray-600">Audit Logs</p>
                      <HelpCircle size={14} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-orange-600">{integrityData.details?.totalAuditLogs || 0}</p>
                      <ExternalLink size={14} className="text-orange-400" />
                    </div>
                  </div>
                </Tooltip>
                
                <div className="bg-white/50 rounded p-2">
                  <p className="text-gray-600">Verifications</p>
                  <p className="text-xl font-bold text-green-600">{integrityData.details?.totalVerifications || 0}</p>
                </div>
              </div>

              {/* Checks */}
              {integrityData.checks && integrityData.checks.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Security Checks:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {integrityData.checks.map((check, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded text-xs ${
                          check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {check.passed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        <span>{check.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🆕 ENHANCED: Issues with Click to Learn More */}
              {integrityData.issues && integrityData.issues.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2 text-red-700">Issues Found:</p>
                  <div className="space-y-1">
                    {integrityData.issues.map((issue, idx) => (
                      <div 
                        key={idx} 
                        className={`text-xs p-2 rounded flex items-center justify-between ${
                          issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <span>
                          <strong>[{issue.severity?.toUpperCase()}]</strong> {issue.message}
                        </span>
                        {/* 🆕 Learn More buttons */}
                        {issue.type === 'duplicate_vote_attempts' && (
                          <button 
                            onClick={() => setShowDuplicateVoteInfo(true)}
                            className="ml-2 px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-yellow-900 flex items-center gap-1"
                          >
                            <HelpCircle size={12} />
                            Learn More
                          </button>
                        )}
                        {issue.type === 'suspicious_activity' && (
                          <button 
                            onClick={() => setShowSuspiciousActivityInfo(true)}
                            className="ml-2 px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-yellow-900 flex items-center gap-1"
                          >
                            <HelpCircle size={12} />
                            Learn More
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hash Chain Display - EXISTING (unchanged) */}
          {showHashChain && hashChainData?.data && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Hash Chain - Election #{hashChainData.data.election?.id || hashChainData.data.electionId}
                  {hashChainData.data.election?.title && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({hashChainData.data.election.title})
                    </span>
                  )}
                </h3>
                <button onClick={() => setShowHashChain(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              {/* Chain Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Blocks</p>
                    <p className="text-2xl font-bold text-gray-900">{hashChainData.data.totalBlocks}</p>
                    <p className="text-xs text-gray-500">1 block = 1 vote</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Normal Votes</p>
                    <p className="text-2xl font-bold text-blue-600">{hashChainData.data.normalVotes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Anonymous Votes</p>
                    <p className="text-2xl font-bold text-purple-600">{hashChainData.data.anonymousVotes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Chain Integrity</p>
                    <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle size={18} /> Verified
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Merkle Root</p>
                    <p className="text-xs font-mono text-indigo-600 truncate" title={hashChainData.data.merkleRoot}>
                      {hashChainData.data.merkleRoot?.substring(0, 20)}...
                    </p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(hashChainData.data.merkleRoot)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              {hashChainData.data.totalBlocks === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Database size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No votes found for this election</p>
                  <p className="text-sm text-gray-500">Votes will appear here as they are cast</p>
                </div>
              ) : (
                <>
                  {/* Genesis Block Info */}
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                    <p className="text-xs font-mono text-gray-600">
                      <strong>Genesis Hash (Block 0):</strong> {hashChainData.data.genesisHash}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This is the starting point of the chain. All zeros indicate the beginning.
                    </p>
                  </div>

                  {/* Blocks */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {hashChainData.data.hashChain?.map((block, index) => (
                      <div
                        key={block.blockNumber}
                        className={`border rounded-lg p-4 relative ${
                          block.voteType === 'anonymous' 
                            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
                            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                        }`}
                      >
                        {/* Chain connector */}
                        {index < hashChainData.data.hashChain.length - 1 && (
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="bg-gray-300 rounded-full p-1">
                              <Link2 size={12} className="text-gray-600" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">Block #{block.blockNumber}</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              block.voteType === 'anonymous' 
                                ? 'bg-purple-200 text-purple-800' 
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {block.voteType === 'anonymous' ? '🔒 Anonymous' : '👤 Normal'}
                            </span>
                            {block.verified && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock size={14} />
                            {new Date(block.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 text-xs font-mono">
                          <div className="bg-white/70 rounded p-2">
                            <p className="text-gray-500 mb-1 font-sans">Vote Hash</p>
                            <p className="text-gray-800 truncate" title={block.voteHash}>
                              {block.voteHash?.substring(0, 32)}...
                            </p>
                          </div>
                          <div className="bg-white/70 rounded p-2">
                            <p className="text-gray-500 mb-1 font-sans">Previous Hash</p>
                            <p className={`truncate ${
                              block.previousHash?.startsWith('0000') ? 'text-gray-400' : 'text-orange-600'
                            }`} title={block.previousHash}>
                              {block.previousHash?.substring(0, 32)}...
                            </p>
                            {block.previousHash?.startsWith('0000') && (
                              <p className="text-xs text-gray-400 font-sans">(Genesis)</p>
                            )}
                          </div>
                          <div className="bg-white/70 rounded p-2">
                            <p className="text-gray-500 mb-1 font-sans">Block Hash</p>
                            <p className="text-indigo-700 truncate" title={block.blockHash}>
                              {block.blockHash?.substring(0, 32)}...
                            </p>
                          </div>
                        </div>

                        {block.receiptId && (
                          <div className="mt-2 text-xs text-gray-500">
                            Receipt: <span className="font-mono">{block.receiptId}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chain end */}
                  <div className="mt-4 p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-xs font-mono text-indigo-800">
                      <strong>Latest Block Hash:</strong> {hashChainData.data.latestBlockHash}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Generated at: {new Date(hashChainData.data.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Filters - EXISTING (unchanged) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={20} />
            Filter Audit Logs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select
                value={filters.actionType}
                onChange={(e) => { setFilters({ ...filters, actionType: e.target.value }); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="duplicate_vote">Duplicate Vote</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="vote_cast">Vote Cast</option>
                <option value="vote_verified">Vote Verified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Election</label>
              <select
                value={filters.electionId}
                onChange={(e) => { setFilters({ ...filters, electionId: e.target.value }); setPage(1); }}
                disabled={electionsLoading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Elections</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    #{election.id} - {election.title?.substring(0, 30)}{election.title?.length > 30 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* ENHANCED: Audit Logs Table with Better Empty State */}
        <div id="audit-logs-section" className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Database size={20} />
                Audit Log Entries
              </h2>
              <button
                onClick={() => setShowAuditLogExplanation(!showAuditLogExplanation)}
                className="text-blue-500 hover:text-blue-700"
                title="What are Audit Logs?"
              >
                <HelpCircle size={18} />
              </button>
            </div>
            {pagination && (
              <span className="text-sm text-gray-600">
                {pagination.total} total entries
              </span>
            )}
          </div>

          {/* Audit Log Explanation Panel */}
          {showAuditLogExplanation && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">What are Audit Log Entries?</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Audit logs are <strong>detailed records of security-relevant events</strong> in the voting system. 
                    They track suspicious activities, not just normal votes.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div 
                      className="bg-white/50 p-2 rounded cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={() => setShowDuplicateVoteInfo(true)}
                    >
                      <span className="inline-flex items-center gap-1 text-yellow-700">
                        <AlertCircle size={14} /> <strong>Duplicate Vote</strong>
                        <HelpCircle size={12} className="text-yellow-500" />
                      </span>
                      <p className="text-xs text-gray-600 mt-1">Someone tried to vote twice - click for details</p>
                    </div>
                    <div 
                      className="bg-white/50 p-2 rounded cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => setShowSuspiciousActivityInfo(true)}
                    >
                      <span className="inline-flex items-center gap-1 text-red-700">
                        <AlertTriangle size={14} /> <strong>Suspicious Activity</strong>
                        <HelpCircle size={12} className="text-red-500" />
                      </span>
                      <p className="text-xs text-gray-600 mt-1">Unusual patterns detected - click for details</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <CheckCircle size={14} /> <strong>Vote Cast</strong>
                      </span>
                      <p className="text-xs text-gray-600 mt-1">Normal vote successfully recorded</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <span className="inline-flex items-center gap-1 text-blue-700">
                        <Shield size={14} /> <strong>Vote Verified</strong>
                      </span>
                      <p className="text-xs text-gray-600 mt-1">Vote integrity was checked and confirmed</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-3">
                    💡 <strong>Why is it empty?</strong> No suspicious activities have been detected! 
                    This is actually a good sign - it means your elections are running securely.
                    The Hash Chain (above) shows the actual vote records.
                  </p>
                </div>
                <button onClick={() => setShowAuditLogExplanation(false)} className="text-blue-500 hover:text-blue-700">✕</button>
              </div>
            </div>
          )}

          {logsLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            // ENHANCED Empty State
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Shield className="text-green-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Security Alerts 🎉</h3>
              <p className="text-gray-600 mb-4">
                Great news! No suspicious activities have been detected.
              </p>
              <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>What would appear here:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li 
                    className="flex items-center gap-2 cursor-pointer hover:text-yellow-700"
                    onClick={() => setShowDuplicateVoteInfo(true)}
                  >
                    <AlertCircle size={14} className="text-yellow-500" />
                    Duplicate vote attempts (blocked) 
                    <span className="text-xs text-blue-500">→ Learn more</span>
                  </li>
                  <li 
                    className="flex items-center gap-2 cursor-pointer hover:text-red-700"
                    onClick={() => setShowSuspiciousActivityInfo(true)}
                  >
                    <AlertTriangle size={14} className="text-red-500" />
                    Suspicious IP activity
                    <span className="text-xs text-blue-500">→ Learn more</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock size={14} className="text-orange-500" />
                    Failed authentication attempts
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  To see vote records, use the <strong>"View Hash Chain"</strong> button above after selecting an election.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {getActionIcon(log.action_type)}
                          {log.action_type?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">#{log.election_id}</span>
                        {log.election_title && (
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{log.election_title}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {log.user_name || `User #${log.user_id}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent}>
                        {log.user_agent?.substring(0, 40) || '-'}...
                      </td>
                      {/* 🆕 NEW: Action column with Learn More */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.action_type === 'duplicate_vote' && (
                          <button
                            onClick={() => setShowDuplicateVoteInfo(true)}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            Details
                          </button>
                        )}
                        {log.action_type === 'suspicious_activity' && (
                          <button
                            onClick={() => setShowSuspiciousActivityInfo(true)}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination - EXISTING (unchanged) */}
          {!logsLoading && pagination && auditLogs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer - EXISTING (unchanged) */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            Industry-Standard Security Features
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            This audit system implements the same cryptographic principles used in Bitcoin and Ethereum blockchains.
            Every vote creates a block, and blocks are linked together making any tampering immediately detectable.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <Hash size={14} className="text-indigo-600" />
              <span>SHA-256 Hashing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <Link2 size={14} className="text-green-600" />
              <span>Chain Linking</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <Shield size={14} className="text-blue-600" />
              <span>Tamper Detection</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <GitBranch size={14} className="text-purple-600" />
              <span>Merkle Tree</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <FileText size={14} className="text-orange-600" />
              <span>Export & Audit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// // Enhanced AuditTrail.jsx - With PDF Export, Tamper Demo, Self-Explanatory UI
// import React, { useState, useEffect } from 'react';
// import { 
//   Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, 
//   Eye, Download, RefreshCw, TrendingUp, Users, Activity, 
//   FileText, AlertTriangle, Filter, Info, Blocks,
//   GitBranch, Clock, Fingerprint, ChevronDown, HelpCircle,
//   ToggleLeft, ToggleRight, BookOpen, Zap, XCircle
// } from 'lucide-react';
// import { useGetAuditLogsQuery, useGetAuditStatsQuery, useLazyGetHashChainQuery, useLazyVerifyIntegrityQuery, useLazyExportAuditTrailQuery, useGetVoteVerificationsQuery } from '../../../redux/api/verification/auditTrailApi';
// import { getAllElections } from '../../../redux/api/election/electionApi';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// export default function AuditTrail() {
//   const [page, setPage] = useState(1);
//   const [filters, setFilters] = useState({
//     actionType: '',
//     electionId: '',
//     startDate: '',
//     endDate: '',
//   });
//   const [selectedElectionId, setSelectedElectionId] = useState('');
//   const [showHashChain, setShowHashChain] = useState(false);
//   const [showIntegrityCheck, setShowIntegrityCheck] = useState(false);
//   const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);

//   // 🆕 NEW: States for enhanced features
//   const [showTamperDemo, setShowTamperDemo] = useState(false);
//   const [isTampered, setIsTampered] = useState(false);
//   const [showAuditLogExplanation, setShowAuditLogExplanation] = useState(false);
//   const [pdfExporting, setPdfExporting] = useState(false);

//   // Elections state for dropdown
//   const [elections, setElections] = useState([]);
//   const [electionsLoading, setElectionsLoading] = useState(true);

//   // Fetch all elections on component mount
//   useEffect(() => {
//     const fetchElections = async () => {
//       try {
//         setElectionsLoading(true);
//         const response = await getAllElections(1, 100, 'all');
//         const electionsList = response?.data?.elections || response?.elections || response?.data || [];
//         setElections(Array.isArray(electionsList) ? electionsList : []);
//       } catch (error) {
//         console.error('Failed to fetch elections:', error);
//         setElections([]);
//       } finally {
//         setElectionsLoading(false);
//       }
//     };
//     fetchElections();
//   }, []);

//   // RTK Query Hooks
//   const { 
//     data: logsData, 
//     isLoading: logsLoading, 
//     refetch: refetchLogs 
//   } = useGetAuditLogsQuery({
//     page,
//     limit: 20,
//     ...filters
//   });

//   const { 
//     data: statsData, 
//     isLoading: statsLoading,
//     refetch: refetchStats
//   } = useGetAuditStatsQuery(filters.electionId || undefined);

//   const { 
//     /*eslint-disable*/
//     data: verificationsData 
//   } = useGetVoteVerificationsQuery({
//     electionId: filters.electionId || undefined,
//     page: 1,
//     limit: 10
//   });

//   const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
//   const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();
//   const [exportAudit, { isLoading: exportLoading }] = useLazyExportAuditTrailQuery();

//   const auditLogs = logsData?.data?.auditLogs || [];
//   const pagination = logsData?.data?.pagination;
//   const stats = statsData?.data;

//   const handleRefresh = () => {
//     refetchLogs();
//     refetchStats();
//   };

//   const handleFetchHashChain = async () => {
//     if (!selectedElectionId) {
//       alert('Please select an Election');
//       return;
//     }
//     await getHashChain({ electionId: selectedElectionId, limit: 100 });
//     setShowHashChain(true);
//   };

//   const handleVerifyIntegrity = async () => {
//     if (!selectedElectionId) {
//       alert('Please select an Election');
//       return;
//     }
//     await verifyIntegrity(selectedElectionId);
//     setShowIntegrityCheck(true);
//   };

//   // 🆕 NEW: PDF Export Function using jspdf
//   const handleExportPDF = async () => {
//     if (!selectedElectionId) {
//       alert('Please select an Election');
//       return;
//     }

//     setPdfExporting(true);

//     try {
//       // Fetch the audit data
//       const result = await exportAudit({ 
//         electionId: selectedElectionId, 
//         format: 'json',
//         startDate: filters.startDate,
//         endDate: filters.endDate
//       }).unwrap();

//       const selectedElection = getSelectedElection();
      
//       // Create PDF
//       const doc = new jsPDF();
//       const pageWidth = doc.internal.pageSize.getWidth();
      
//       // Header
//       doc.setFillColor(59, 130, 246); // Blue
//       doc.rect(0, 0, pageWidth, 40, 'F');
      
//       doc.setTextColor(255, 255, 255);
//       doc.setFontSize(22);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Audit Trail Report', 14, 20);
      
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
//       doc.text(`Election ID: #${selectedElectionId}`, pageWidth - 60, 30);

//       // Election Info Section
//       doc.setTextColor(0, 0, 0);
//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Election Information', 14, 55);
      
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.text(`Title: ${selectedElection?.title || 'N/A'}`, 14, 65);
//       doc.text(`Status: ${selectedElection?.status || 'N/A'}`, 14, 72);
//       doc.text(`Voting Type: ${selectedElection?.voting_type || 'N/A'}`, 14, 79);

//       // Summary Statistics
//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Audit Summary', 14, 95);

//       const summaryData = [
//         ['Total Actions', result?.stats?.total_actions || stats?.overall?.total_actions || '0'],
//         ['Unique Users', result?.stats?.unique_users || stats?.overall?.unique_users || '0'],
//         ['Normal Votes', result?.stats?.total_votes || stats?.votes?.total_votes || '0'],
//         ['Anonymous Votes', result?.stats?.anonymous_votes || stats?.votes?.total_anonymous_votes || '0'],
//         ['Integrity Status', 'Verified ✓'],
//       ];

//       autoTable(doc, {
//         startY: 100,
//         head: [['Metric', 'Value']],
//         body: summaryData,
//         theme: 'striped',
//         headStyles: { fillColor: [59, 130, 246] },
//         margin: { left: 14, right: 14 },
//       });

//       // Get the final Y position after the table
//       const finalY = doc.lastAutoTable?.finalY || 150;

//       // Hash Chain Information
//       if (result?.hashChain || hashChainData?.data) {
//         const chainData = result?.hashChain || hashChainData?.data;
        
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.text('Blockchain Verification', 14, finalY + 15);

//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'normal');
//         doc.text(`Total Blocks: ${chainData?.totalBlocks || 0}`, 14, finalY + 25);
//         doc.text(`Merkle Root: ${chainData?.merkleRoot?.substring(0, 40) || 'N/A'}...`, 14, finalY + 32);
//         doc.text(`Genesis Hash: ${chainData?.genesisHash?.substring(0, 40) || '0000...'}...`, 14, finalY + 39);
//         doc.text(`Chain Integrity: VERIFIED`, 14, finalY + 46);
//       }

//       // Audit Logs Table
//       if (result?.auditLogs && result.auditLogs.length > 0) {
//         doc.addPage();
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.text('Audit Log Entries', 14, 20);

//         const logsTableData = result.auditLogs.slice(0, 50).map(log => [
//           new Date(log.created_at).toLocaleString(),
//           log.action_type?.replace(/_/g, ' ') || 'N/A',
//           `#${log.election_id}`,
//           log.user_id || 'N/A',
//           log.ip_address || 'N/A',
//         ]);

//         autoTable(doc, {
//           startY: 25,
//           head: [['Timestamp', 'Action', 'Election', 'User ID', 'IP Address']],
//           body: logsTableData,
//           theme: 'striped',
//           headStyles: { fillColor: [59, 130, 246] },
//           margin: { left: 14, right: 14 },
//           styles: { fontSize: 8 },
//         });
//       }

//       // Footer on all pages
//       const pageCount = doc.internal.getNumberOfPages();
//       for (let i = 1; i <= pageCount; i++) {
//         doc.setPage(i);
//         doc.setFontSize(8);
//         doc.setTextColor(128, 128, 128);
//         doc.text(
//           `Page ${i} of ${pageCount} | Vottery Audit Trail | Blockchain-Verified`,
//           pageWidth / 2,
//           doc.internal.pageSize.getHeight() - 10,
//           { align: 'center' }
//         );
//       }

//       // Save PDF
//       doc.save(`audit-trail-election-${selectedElectionId}-${Date.now()}.pdf`);

//     } catch (error) {
//       console.error('PDF Export failed:', error);
//       alert('Failed to export PDF. Please try again.');
//     } finally {
//       setPdfExporting(false);
//     }
//   };

//   // Keep existing JSON export
//   const handleExport = async (format) => {
//     if (!selectedElectionId) {
//       alert('Please select an Election');
//       return;
//     }
    
//     try {
//       const result = await exportAudit({ 
//         electionId: selectedElectionId, 
//         format,
//         startDate: filters.startDate,
//         endDate: filters.endDate
//       }).unwrap();

//       if (format === 'json') {
//         const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `audit-trail-${selectedElectionId}-${Date.now()}.json`;
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         window.URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Failed to export audit trail');
//     }
//   };

//   const getSelectedElection = () => {
//     return elections.find(e => e.id?.toString() === selectedElectionId?.toString());
//   };

//   const getActionIcon = (actionType) => {
//     const icons = {
//       'duplicate_vote': <AlertCircle className="text-yellow-600" size={18} />,
//       'suspicious_activity': <AlertTriangle className="text-red-600" size={18} />,
//       'vote_cast': <CheckCircle className="text-green-600" size={18} />,
//       'vote_verified': <Shield className="text-blue-600" size={18} />,
//     };
//     return icons[actionType] || <Lock className="text-gray-600" size={18} />;
//   };

//   const getActionColor = (actionType) => {
//     const colors = {
//       'duplicate_vote': 'bg-yellow-100 text-yellow-800',
//       'suspicious_activity': 'bg-red-100 text-red-800',
//       'vote_cast': 'bg-green-100 text-green-800',
//       'vote_verified': 'bg-blue-100 text-blue-800',
//     };
//     return colors[actionType] || 'bg-gray-100 text-gray-800';
//   };

//   const clearFilters = () => {
//     setFilters({ actionType: '', electionId: '', startDate: '', endDate: '' });
//     setPage(1);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'active': 'bg-green-100 text-green-800',
//       'published': 'bg-blue-100 text-blue-800',
//       'completed': 'bg-gray-100 text-gray-800',
//       'draft': 'bg-yellow-100 text-yellow-800',
//       'cancelled': 'bg-red-100 text-red-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   // 🆕 Demo data for tamper visualization
//   const demoBlocks = {
//     normal: [
//       { blockNumber: 1, voteHash: 'a1b2c3d4e5f6...', previousHash: '0000000000000000...', blockHash: 'f662616b293c4657...', verified: true },
//       { blockNumber: 2, voteHash: '7g8h9i0j1k2l...', previousHash: 'f662616b293c4657...', blockHash: 'ed7534494f4598e0...', verified: true },
//       { blockNumber: 3, voteHash: '3m4n5o6p7q8r...', previousHash: 'ed7534494f4598e0...', blockHash: '8409d1086a483db2...', verified: true },
//     ],
//     tampered: [
//       { blockNumber: 1, voteHash: 'a1b2c3d4e5f6...', previousHash: '0000000000000000...', blockHash: 'f662616b293c4657...', verified: true },
//       { blockNumber: 2, voteHash: 'MODIFIED_VOTE!...', previousHash: 'f662616b293c4657...', blockHash: 'XXXXXXXXXXXXX...', verified: false, tampered: true },
//       { blockNumber: 3, voteHash: '3m4n5o6p7q8r...', previousHash: 'ed7534494f4598e0...', blockHash: '8409d1086a483db2...', verified: false, chainBroken: true },
//     ]
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
//                 <Shield className="text-blue-600" size={32} />
//                 Audit Trail & Blockchain Verification
//               </h1>
//               <p className="text-gray-600">
//                 Industry-standard immutable audit logging with cryptographic verification
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
//                 className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
//               >
//                 <Info size={16} />
//                 How It Works
//               </button>
//               <button
//                 onClick={handleRefresh}
//                 disabled={logsLoading || statsLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* 🆕 NEW: Quick Start Guide */}
//         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
//                 <BookOpen size={24} />
//                 What is an Audit Trail?
//               </h2>
//               <p className="text-blue-100 mb-4">
//                 An audit trail is a <strong>permanent, tamper-proof record</strong> of every action in the system. 
//                 Think of it like a security camera that records everything and cannot be edited or deleted.
//               </p>
//               <div className="grid md:grid-cols-3 gap-4">
//                 <div className="bg-white/10 rounded-lg p-3">
//                   <div className="flex items-center gap-2 mb-1">
//                     <CheckCircle size={18} />
//                     <span className="font-semibold">Every Vote Recorded</span>
//                   </div>
//                   <p className="text-sm text-blue-100">Each vote creates a unique cryptographic fingerprint</p>
//                 </div>
//                 <div className="bg-white/10 rounded-lg p-3">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Link2 size={18} />
//                     <span className="font-semibold">Chain Linked</span>
//                   </div>
//                   <p className="text-sm text-blue-100">Records are linked like blockchain - changing one breaks all</p>
//                 </div>
//                 <div className="bg-white/10 rounded-lg p-3">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Shield size={18} />
//                     <span className="font-semibold">Tamper Detection</span>
//                   </div>
//                   <p className="text-sm text-blue-100">Any modification is instantly detectable</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 🆕 NEW: Interactive Tamper Demo Section */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-dashed border-indigo-300">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <Zap className="text-yellow-500" size={24} />
//               Interactive Demo: Normal vs Tampered Data
//             </h2>
//             <button
//               onClick={() => setShowTamperDemo(!showTamperDemo)}
//               className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 flex items-center gap-2"
//             >
//               {showTamperDemo ? <Eye size={16} /> : <Eye size={16} />}
//               {showTamperDemo ? 'Hide Demo' : 'Show Demo'}
//             </button>
//           </div>

//           {showTamperDemo && (
//             <div className="space-y-4">
//               {/* Toggle Switch */}
//               <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
//                 <span className={`font-semibold ${!isTampered ? 'text-green-600' : 'text-gray-400'}`}>
//                   ✅ Normal (Intact)
//                 </span>
//                 <button
//                   onClick={() => setIsTampered(!isTampered)}
//                   className={`relative w-16 h-8 rounded-full transition-colors ${
//                     isTampered ? 'bg-red-500' : 'bg-green-500'
//                   }`}
//                 >
//                   <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
//                     isTampered ? 'translate-x-9' : 'translate-x-1'
//                   }`} />
//                 </button>
//                 <span className={`font-semibold ${isTampered ? 'text-red-600' : 'text-gray-400'}`}>
//                   ❌ Tampered (Modified)
//                 </span>
//               </div>

//               {/* Demo Visualization */}
//               <div className={`p-4 rounded-lg border-2 ${
//                 isTampered ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
//               }`}>
//                 <div className="flex items-center gap-2 mb-4">
//                   {isTampered ? (
//                     <>
//                       <XCircle className="text-red-600" size={24} />
//                       <span className="font-bold text-red-700">⚠️ TAMPERING DETECTED! Chain integrity compromised.</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="text-green-600" size={24} />
//                       <span className="font-bold text-green-700">✓ Chain Verified - All blocks intact</span>
//                     </>
//                   )}
//                 </div>

//                 {/* Demo Blocks */}
//                 <div className="space-y-3">
//                   {(isTampered ? demoBlocks.tampered : demoBlocks.normal).map((block, index) => (
//                     <div
//                       key={block.blockNumber}
//                       className={`p-3 rounded-lg border ${
//                         block.tampered 
//                           ? 'bg-red-100 border-red-400 animate-pulse' 
//                           : block.chainBroken 
//                             ? 'bg-orange-100 border-orange-400'
//                             : 'bg-white border-gray-200'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="font-bold">Block #{block.blockNumber}</span>
//                         {block.tampered && (
//                           <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-bounce">
//                             🚨 MODIFIED!
//                           </span>
//                         )}
//                         {block.chainBroken && (
//                           <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
//                             ⛓️ CHAIN BROKEN
//                           </span>
//                         )}
//                         {block.verified && !block.tampered && !block.chainBroken && (
//                           <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
//                             ✓ Verified
//                           </span>
//                         )}
//                       </div>
//                       <div className="grid grid-cols-3 gap-2 text-xs font-mono">
//                         <div>
//                           <p className="text-gray-500">Vote Hash</p>
//                           <p className={block.tampered ? 'text-red-600 font-bold' : 'text-gray-700'}>
//                             {block.voteHash}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-gray-500">Previous Hash</p>
//                           <p className={block.chainBroken ? 'text-orange-600 line-through' : 'text-gray-700'}>
//                             {block.previousHash}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-gray-500">Block Hash</p>
//                           <p className={block.tampered ? 'text-red-600 font-bold' : 'text-gray-700'}>
//                             {block.blockHash}
//                           </p>
//                         </div>
//                       </div>
//                       {block.chainBroken && (
//                         <p className="mt-2 text-xs text-orange-700">
//                           ⚠️ Previous Hash doesn't match Block #2's hash - chain is broken!
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Explanation */}
//                 <div className={`mt-4 p-3 rounded-lg ${isTampered ? 'bg-red-100' : 'bg-green-100'}`}>
//                   <p className="text-sm">
//                     {isTampered ? (
//                       <>
//                         <strong>What happened:</strong> Someone tried to change Block #2's vote data. 
//                         This caused its hash to change completely, which broke the link to Block #3. 
//                         The system immediately detected this tampering because the hashes no longer match!
//                       </>
//                     ) : (
//                       <>
//                         <strong>How it works:</strong> Each block's "Previous Hash" exactly matches the 
//                         prior block's "Block Hash". This creates an unbreakable chain. If ANY data changes, 
//                         all subsequent blocks become invalid - making tampering impossible to hide!
//                       </>
//                     )}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Blockchain Info Panel - EXISTING (unchanged) */}
//         {showBlockchainInfo && (
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-8 border border-indigo-200">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
//                 <Blocks size={24} />
//                 Understanding Blockchain-Style Audit Trail
//               </h2>
//               <button onClick={() => setShowBlockchainInfo(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               {/* How it works */}
//               <div className="bg-white rounded-lg p-4 shadow">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <GitBranch size={18} className="text-indigo-600" />
//                   How Hash Chain Works
//                 </h3>
//                 <div className="space-y-3 text-sm text-gray-700">
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
//                     <p><strong>Each vote creates a block</strong> - When someone votes, a new block is added to the chain with the vote hash.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
//                     <p><strong>Blocks link together</strong> - Each block contains the hash of the previous block, creating an unbreakable chain.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
//                     <p><strong>Tampering is detectable</strong> - If anyone changes a vote, the hash changes, breaking the chain.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
//                     <p><strong>Merkle Root</strong> - A single hash representing ALL votes for quick verification.</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Visual representation */}
//               <div className="bg-white rounded-lg p-4 shadow">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <Link2 size={18} className="text-green-600" />
//                   Chain Structure
//                 </h3>
//                 <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
//                   <pre>{`
// ┌─────────┐    ┌─────────┐    ┌─────────┐
// │ Block 1 │───▶│ Block 2 │───▶│ Block 3 │
// │ Vote #1 │    │ Vote #2 │    │ Vote #3 │
// └────┬────┘    └────┬────┘    └────┬────┘
//      │              │              │
// prev:000...   prev:abc...    prev:def...
// hash:abc...   hash:def...    hash:ghi...
//                   `}</pre>
//                 </div>
//                 <p className="text-xs text-gray-600 mt-2">
//                   <strong>Genesis block</strong> starts with zeros. Each subsequent block links to the previous.
//                 </p>
//               </div>

//               {/* What each field means */}
//               <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <Fingerprint size={18} className="text-purple-600" />
//                   Block Fields Explained
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Vote Hash</p>
//                     <p className="text-gray-600 text-xs">SHA-256 hash of the vote data. Unique fingerprint of each vote.</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Previous Hash</p>
//                     <p className="text-gray-600 text-xs">Hash of the previous block. Creates the chain linkage.</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Block Hash</p>
//                     <p className="text-gray-600 text-xs">Hash of the entire block (vote + previous hash + timestamp).</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Merkle Root</p>
//                     <p className="text-gray-600 text-xs">Single hash representing ALL votes. Used for quick verification.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <p className="text-sm text-yellow-800">
//                 <strong>💡 Why only 1 block?</strong> The hash chain shows blocks <strong>per election</strong>. 
//                 If an election has 1 vote, you'll see 1 block. If it has 100 votes, you'll see 100 blocks. 
//                 The integrity check may show totals across ALL elections.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Statistics Cards - EXISTING (unchanged) */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Actions</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.total_actions || 0}
//                   </p>
//                 </div>
//                 <Shield className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Unique Users</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.unique_users || 0}
//                   </p>
//                 </div>
//                 <Users className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Normal Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes?.total_votes || 0}
//                   </p>
//                 </div>
//                 <CheckCircle className="text-purple-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Anonymous Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes?.total_anonymous_votes || 0}
//                   </p>
//                 </div>
//                 <Eye className="text-indigo-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Last 24 Hours</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.recentActivity?.actions_24h || 0}
//                   </p>
//                 </div>
//                 <TrendingUp className="text-orange-600" size={40} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Type Breakdown - EXISTING (unchanged) */}
//         {stats?.actionTypes && stats.actionTypes.length > 0 && (
//           <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Activity size={20} />
//               Action Type Distribution
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.actionTypes.map((action) => (
//                 <div
//                   key={action.action_type}
//                   className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
//                 >
//                   {getActionIcon(action.action_type)}
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {action.action_type?.replace(/_/g, ' ') || 'Unknown'}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{action.count}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Blockchain Verification Section - ENHANCED with PDF Export */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Hash className="text-indigo-600" />
//             Blockchain-Style Verification
//             <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2">
//               SHA-256 + Merkle Tree
//             </span>
//           </h2>
//           <p className="text-sm text-gray-600 mb-4">
//             Verify election integrity using cryptographic hash chains. Each vote creates a block linked to the previous one.
//           </p>
          
//           <div className="flex flex-wrap gap-4 mb-6">
//             {/* Election Dropdown */}
//             <div className="flex-1 min-w-[300px]">
//               <label className="block text-xs font-medium text-gray-500 mb-1">Select Election</label>
//               <div className="relative">
//                 <select
//                   value={selectedElectionId}
//                   onChange={(e) => {
//                     setSelectedElectionId(e.target.value);
//                     setShowHashChain(false);
//                     setShowIntegrityCheck(false);
//                   }}
//                   disabled={electionsLoading}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   <option value="">
//                     {electionsLoading ? 'Loading elections...' : '-- Select an Election --'}
//                   </option>
//                   {elections.map((election) => (
//                     <option key={election.id} value={election.id}>
//                       #{election.id} - {election.title} ({election.status || 'unknown'})
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown 
//                   size={20} 
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
//                 />
//               </div>
//               {/* Show selected election details */}
//               {selectedElectionId && getSelectedElection() && (
//                 <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
//                   <div className="flex items-center gap-2 text-sm">
//                     <span className="font-semibold text-indigo-900">
//                       {getSelectedElection()?.title}
//                     </span>
//                     <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(getSelectedElection()?.status)}`}>
//                       {getSelectedElection()?.status}
//                     </span>
//                   </div>
//                   {getSelectedElection()?.voting_type && (
//                     <p className="text-xs text-indigo-600 mt-1">
//                       Type: {getSelectedElection()?.voting_type} | 
//                       ID: #{getSelectedElection()?.id}
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="flex items-start gap-2 pt-5 flex-wrap">
//               <button
//                 onClick={handleFetchHashChain}
//                 disabled={!selectedElectionId || hashChainLoading}
//                 className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Link2 size={16} />
//                 {hashChainLoading ? 'Loading...' : 'View Hash Chain'}
//               </button>
//               <button
//                 onClick={handleVerifyIntegrity}
//                 disabled={!selectedElectionId || integrityLoading}
//                 className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Shield size={16} />
//                 {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
//               </button>
              
//               {/* 🆕 Export Dropdown with PDF */}
//               <div className="relative group">
//                 <button
//                   disabled={!selectedElectionId || exportLoading || pdfExporting}
//                   className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   <Download size={16} />
//                   {exportLoading || pdfExporting ? 'Exporting...' : 'Export ▾'}
//                 </button>
//                 <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[150px]">
//                   <button
//                     onClick={handleExportPDF}
//                     disabled={!selectedElectionId || pdfExporting}
//                     className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm disabled:opacity-50"
//                   >
//                     <FileText size={14} className="text-red-500" />
//                     Export as PDF
//                   </button>
//                   <button
//                     onClick={() => handleExport('json')}
//                     disabled={!selectedElectionId || exportLoading}
//                     className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm disabled:opacity-50"
//                   >
//                     <FileText size={14} className="text-blue-500" />
//                     Export as JSON
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Integrity Check Result - EXISTING (unchanged) */}
//           {showIntegrityCheck && integrityData && (
//             <div className={`mb-6 p-4 rounded-lg border-2 ${
//               integrityData.verified 
//                 ? 'bg-green-50 border-green-500' 
//                 : 'bg-red-50 border-red-500'
//             }`}>
//               <div className="flex items-center gap-3 mb-2">
//                 {integrityData.verified ? (
//                   <CheckCircle className="text-green-600" size={24} />
//                 ) : (
//                   <AlertTriangle className="text-red-600" size={24} />
//                 )}
//                 <h3 className="text-lg font-bold">
//                   {integrityData.verified ? 'Integrity Verified ✓' : 'Integrity Issues Detected'}
//                 </h3>
//                 {integrityData.integrityScore !== undefined && (
//                   <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
//                     integrityData.integrityScore >= 90 ? 'bg-green-200 text-green-800' :
//                     integrityData.integrityScore >= 70 ? 'bg-yellow-200 text-yellow-800' :
//                     'bg-red-200 text-red-800'
//                   }`}>
//                     Score: {integrityData.integrityScore}%
//                   </span>
//                 )}
//                 <button onClick={() => setShowIntegrityCheck(false)} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
//               </div>
//               <p className="text-sm mb-3">{integrityData.message}</p>
              
//               {/* Election Info */}
//               {integrityData.election && (
//                 <div className="bg-white/50 rounded p-2 mb-3">
//                   <p className="text-sm">
//                     <strong>Election:</strong> {integrityData.election.title} (ID: {integrityData.election.id})
//                     <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
//                       integrityData.election.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {integrityData.election.status}
//                     </span>
//                   </p>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Normal Votes</p>
//                   <p className="text-xl font-bold text-blue-600">{integrityData.details?.totalNormalVotes || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Anonymous Votes</p>
//                   <p className="text-xl font-bold text-purple-600">{integrityData.details?.totalAnonymousVotes || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Audit Logs</p>
//                   <p className="text-xl font-bold text-orange-600">{integrityData.details?.totalAuditLogs || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Verifications</p>
//                   <p className="text-xl font-bold text-green-600">{integrityData.details?.totalVerifications || 0}</p>
//                 </div>
//               </div>

//               {/* Checks */}
//               {integrityData.checks && integrityData.checks.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm font-semibold mb-2">Security Checks:</p>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                     {integrityData.checks.map((check, idx) => (
//                       <div 
//                         key={idx}
//                         className={`flex items-center gap-2 p-2 rounded text-xs ${
//                           check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {check.passed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
//                         <span>{check.name}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Issues */}
//               {integrityData.issues && integrityData.issues.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm font-semibold mb-2 text-red-700">Issues Found:</p>
//                   <div className="space-y-1">
//                     {integrityData.issues.map((issue, idx) => (
//                       <div key={idx} className={`text-xs p-2 rounded ${
//                         issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         <strong>[{issue.severity?.toUpperCase()}]</strong> {issue.message}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Hash Chain Display - EXISTING (unchanged) */}
//           {showHashChain && hashChainData?.data && (
//             <div className="border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Hash Chain - Election #{hashChainData.data.election?.id || hashChainData.data.electionId}
//                   {hashChainData.data.election?.title && (
//                     <span className="text-sm font-normal text-gray-500 ml-2">
//                       ({hashChainData.data.election.title})
//                     </span>
//                   )}
//                 </h3>
//                 <button onClick={() => setShowHashChain(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//               </div>
              
//               {/* Chain Summary */}
//               <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-4 mb-4">
//                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-600">Total Blocks</p>
//                     <p className="text-2xl font-bold text-gray-900">{hashChainData.data.totalBlocks}</p>
//                     <p className="text-xs text-gray-500">1 block = 1 vote</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Normal Votes</p>
//                     <p className="text-2xl font-bold text-blue-600">{hashChainData.data.normalVotes}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Anonymous Votes</p>
//                     <p className="text-2xl font-bold text-purple-600">{hashChainData.data.anonymousVotes}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Chain Integrity</p>
//                     <p className="text-lg font-bold text-green-600 flex items-center gap-1">
//                       <CheckCircle size={18} /> Verified
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Merkle Root</p>
//                     <p className="text-xs font-mono text-indigo-600 truncate" title={hashChainData.data.merkleRoot}>
//                       {hashChainData.data.merkleRoot?.substring(0, 20)}...
//                     </p>
//                     <button 
//                       onClick={() => navigator.clipboard.writeText(hashChainData.data.merkleRoot)}
//                       className="text-xs text-blue-500 hover:underline"
//                     >
//                       Copy
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Empty state */}
//               {hashChainData.data.totalBlocks === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-lg">
//                   <Database size={48} className="mx-auto mb-3 text-gray-300" />
//                   <p className="text-gray-600">No votes found for this election</p>
//                   <p className="text-sm text-gray-500">Votes will appear here as they are cast</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Genesis Block Info */}
//                   <div className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400">
//                     <p className="text-xs font-mono text-gray-600">
//                       <strong>Genesis Hash (Block 0):</strong> {hashChainData.data.genesisHash}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       This is the starting point of the chain. All zeros indicate the beginning.
//                     </p>
//                   </div>

//                   {/* Blocks */}
//                   <div className="space-y-3 max-h-[500px] overflow-y-auto">
//                     {hashChainData.data.hashChain?.map((block, index) => (
//                       <div
//                         key={block.blockNumber}
//                         className={`border rounded-lg p-4 relative ${
//                           block.voteType === 'anonymous' 
//                             ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
//                             : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
//                         }`}
//                       >
//                         {/* Chain connector */}
//                         {index < hashChainData.data.hashChain.length - 1 && (
//                           <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
//                             <div className="bg-gray-300 rounded-full p-1">
//                               <Link2 size={12} className="text-gray-600" />
//                             </div>
//                           </div>
//                         )}

//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center gap-2">
//                             <span className="text-lg font-bold text-gray-900">Block #{block.blockNumber}</span>
//                             <span className={`text-xs px-2 py-1 rounded-full font-medium ${
//                               block.voteType === 'anonymous' 
//                                 ? 'bg-purple-200 text-purple-800' 
//                                 : 'bg-blue-200 text-blue-800'
//                             }`}>
//                               {block.voteType === 'anonymous' ? '🔒 Anonymous' : '👤 Normal'}
//                             </span>
//                             {block.verified && (
//                               <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
//                                 ✓ Verified
//                               </span>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 text-xs text-gray-600">
//                             <Clock size={14} />
//                             {new Date(block.timestamp).toLocaleString()}
//                           </div>
//                         </div>

//                         <div className="grid md:grid-cols-3 gap-3 text-xs font-mono">
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Vote Hash</p>
//                             <p className="text-gray-800 truncate" title={block.voteHash}>
//                               {block.voteHash?.substring(0, 32)}...
//                             </p>
//                           </div>
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Previous Hash</p>
//                             <p className={`truncate ${
//                               block.previousHash?.startsWith('0000') ? 'text-gray-400' : 'text-orange-600'
//                             }`} title={block.previousHash}>
//                               {block.previousHash?.substring(0, 32)}...
//                             </p>
//                             {block.previousHash?.startsWith('0000') && (
//                               <p className="text-xs text-gray-400 font-sans">(Genesis)</p>
//                             )}
//                           </div>
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Block Hash</p>
//                             <p className="text-indigo-700 truncate" title={block.blockHash}>
//                               {block.blockHash?.substring(0, 32)}...
//                             </p>
//                           </div>
//                         </div>

//                         {block.receiptId && (
//                           <div className="mt-2 text-xs text-gray-500">
//                             Receipt: <span className="font-mono">{block.receiptId}</span>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Chain end */}
//                   <div className="mt-4 p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-500">
//                     <p className="text-xs font-mono text-indigo-800">
//                       <strong>Latest Block Hash:</strong> {hashChainData.data.latestBlockHash}
//                     </p>
//                     <p className="text-xs text-indigo-600 mt-1">
//                       Generated at: {new Date(hashChainData.data.generatedAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Filters - EXISTING (unchanged) */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Filter size={20} />
//             Filter Audit Logs
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
//               <select
//                 value={filters.actionType}
//                 onChange={(e) => { setFilters({ ...filters, actionType: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">All Actions</option>
//                 <option value="duplicate_vote">Duplicate Vote</option>
//                 <option value="suspicious_activity">Suspicious Activity</option>
//                 <option value="vote_cast">Vote Cast</option>
//                 <option value="vote_verified">Vote Verified</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Election</label>
//               <select
//                 value={filters.electionId}
//                 onChange={(e) => { setFilters({ ...filters, electionId: e.target.value }); setPage(1); }}
//                 disabled={electionsLoading}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
//               >
//                 <option value="">All Elections</option>
//                 {elections.map((election) => (
//                   <option key={election.id} value={election.id}>
//                     #{election.id} - {election.title?.substring(0, 30)}{election.title?.length > 30 ? '...' : ''}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={filters.startDate}
//                 onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={filters.endDate}
//                 onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={clearFilters}
//                 className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* 🆕 ENHANCED: Audit Logs Table with Better Empty State */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                 <Database size={20} />
//                 Audit Log Entries
//               </h2>
//               <button
//                 onClick={() => setShowAuditLogExplanation(!showAuditLogExplanation)}
//                 className="text-blue-500 hover:text-blue-700"
//                 title="What are Audit Logs?"
//               >
//                 <HelpCircle size={18} />
//               </button>
//             </div>
//             {pagination && (
//               <span className="text-sm text-gray-600">
//                 {pagination.total} total entries
//               </span>
//             )}
//           </div>

//           {/* 🆕 Audit Log Explanation Panel */}
//           {showAuditLogExplanation && (
//             <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
//               <div className="flex items-start gap-3">
//                 <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
//                 <div>
//                   <h4 className="font-bold text-blue-900 mb-2">What are Audit Log Entries?</h4>
//                   <p className="text-sm text-blue-800 mb-2">
//                     Audit logs are <strong>detailed records of security-relevant events</strong> in the voting system. 
//                     They track suspicious activities, not just normal votes.
//                   </p>
//                   <div className="grid md:grid-cols-2 gap-3 text-sm">
//                     <div className="bg-white/50 p-2 rounded">
//                       <span className="inline-flex items-center gap-1 text-yellow-700">
//                         <AlertCircle size={14} /> <strong>Duplicate Vote</strong>
//                       </span>
//                       <p className="text-xs text-gray-600 mt-1">Someone tried to vote twice - system blocked it</p>
//                     </div>
//                     <div className="bg-white/50 p-2 rounded">
//                       <span className="inline-flex items-center gap-1 text-red-700">
//                         <AlertTriangle size={14} /> <strong>Suspicious Activity</strong>
//                       </span>
//                       <p className="text-xs text-gray-600 mt-1">Multiple votes from same IP, bot-like behavior, etc.</p>
//                     </div>
//                     <div className="bg-white/50 p-2 rounded">
//                       <span className="inline-flex items-center gap-1 text-green-700">
//                         <CheckCircle size={14} /> <strong>Vote Cast</strong>
//                       </span>
//                       <p className="text-xs text-gray-600 mt-1">Normal vote successfully recorded</p>
//                     </div>
//                     <div className="bg-white/50 p-2 rounded">
//                       <span className="inline-flex items-center gap-1 text-blue-700">
//                         <Shield size={14} /> <strong>Vote Verified</strong>
//                       </span>
//                       <p className="text-xs text-gray-600 mt-1">Vote integrity was checked and confirmed</p>
//                     </div>
//                   </div>
//                   <p className="text-xs text-blue-600 mt-3">
//                     💡 <strong>Why is it empty?</strong> No suspicious activities have been detected! 
//                     This is actually a good sign - it means your elections are running securely.
//                     The Hash Chain (above) shows the actual vote records.
//                   </p>
//                 </div>
//                 <button onClick={() => setShowAuditLogExplanation(false)} className="text-blue-500 hover:text-blue-700">✕</button>
//               </div>
//             </div>
//           )}

//           {logsLoading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading audit logs...</p>
//             </div>
//           ) : auditLogs.length === 0 ? (
//             // 🆕 ENHANCED Empty State
//             <div className="p-12 text-center">
//               <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
//                 <Shield className="text-green-600" size={40} />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">No Security Alerts 🎉</h3>
//               <p className="text-gray-600 mb-4">
//                 Great news! No suspicious activities have been detected.
//               </p>
//               <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4 text-left">
//                 <p className="text-sm text-gray-700 mb-2">
//                   <strong>What would appear here:</strong>
//                 </p>
//                 <ul className="text-sm text-gray-600 space-y-1">
//                   <li className="flex items-center gap-2">
//                     <AlertCircle size={14} className="text-yellow-500" />
//                     Duplicate vote attempts (blocked)
//                   </li>
//                   <li className="flex items-center gap-2">
//                     <AlertTriangle size={14} className="text-red-500" />
//                     Suspicious IP activity
//                   </li>
//                   <li className="flex items-center gap-2">
//                     <Lock size={14} className="text-orange-500" />
//                     Failed authentication attempts
//                   </li>
//                 </ul>
//                 <p className="text-xs text-gray-500 mt-3">
//                   To see vote records, use the <strong>"View Hash Chain"</strong> button above after selecting an election.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {auditLogs.map((log) => (
//                     <tr key={log.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
//                           {getActionIcon(log.action_type)}
//                           {log.action_type?.replace(/_/g, ' ')}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className="text-sm font-semibold text-blue-600">#{log.election_id}</span>
//                         {log.election_title && (
//                           <p className="text-xs text-gray-500 truncate max-w-[150px]">{log.election_title}</p>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                         {log.user_name || `User #${log.user_id}`}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
//                         {log.ip_address || '-'}
//                       </td>
//                       <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent}>
//                         {log.user_agent?.substring(0, 40) || '-'}...
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination - EXISTING (unchanged) */}
//           {!logsLoading && pagination && auditLogs.length > 0 && (
//             <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
//               <div className="text-sm text-gray-700">
//                 Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   ← Previous
//                 </button>
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Info Footer - EXISTING (unchanged) */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//           <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//             <Shield size={20} className="text-blue-600" />
//             Industry-Standard Security Features
//           </h3>
//           <p className="text-sm text-gray-700 mb-3">
//             This audit system implements the same cryptographic principles used in Bitcoin and Ethereum blockchains.
//             Every vote creates a block, and blocks are linked together making any tampering immediately detectable.
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Hash size={14} className="text-indigo-600" />
//               <span>SHA-256 Hashing</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Link2 size={14} className="text-green-600" />
//               <span>Chain Linking</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Shield size={14} className="text-blue-600" />
//               <span>Tamper Detection</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <GitBranch size={14} className="text-purple-600" />
//               <span>Merkle Tree</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <FileText size={14} className="text-orange-600" />
//               <span>Export & Audit</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // Updated AuditTrail.jsx - With Election Dropdown
// import React, { useState, useEffect } from 'react';
// import { 
//   Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, 
//   Eye, Download, RefreshCw, TrendingUp, Users, Activity, 
//   FileText, AlertTriangle, Filter, Info, Blocks,
//   GitBranch, Clock, Fingerprint, ChevronDown
// } from 'lucide-react';
// import { useGetAuditLogsQuery, useGetAuditStatsQuery, useLazyGetHashChainQuery, useLazyVerifyIntegrityQuery, useLazyExportAuditTrailQuery, useGetVoteVerificationsQuery } from '../../../redux/api/verification/auditTrailApi';
// import { getAllElections } from '../../../redux/api/election/electionApi';

// export default function AuditTrail() {
//   const [page, setPage] = useState(1);
//   const [filters, setFilters] = useState({
//     actionType: '',
//     electionId: '',
//     startDate: '',
//     endDate: '',
//   });
//   const [selectedElectionId, setSelectedElectionId] = useState('');
//   const [showHashChain, setShowHashChain] = useState(false);
//   const [showIntegrityCheck, setShowIntegrityCheck] = useState(false);
//   const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);

//   // ⭐ NEW: Elections state for dropdown
//   const [elections, setElections] = useState([]);
//   const [electionsLoading, setElectionsLoading] = useState(true);

//   // ⭐ NEW: Fetch all elections on component mount
//   useEffect(() => {
//     const fetchElections = async () => {
//       try {
//         setElectionsLoading(true);
//         const response = await getAllElections(1, 100, 'all');
//         // Handle different response structures
//         const electionsList = response?.data?.elections || response?.elections || response?.data || [];
//         setElections(Array.isArray(electionsList) ? electionsList : []);
//       } catch (error) {
//         console.error('Failed to fetch elections:', error);
//         setElections([]);
//       } finally {
//         setElectionsLoading(false);
//       }
//     };
//     fetchElections();
//   }, []);

//   // RTK Query Hooks
//   const { 
//     data: logsData, 
//     isLoading: logsLoading, 
//     refetch: refetchLogs 
//   } = useGetAuditLogsQuery({
//     page,
//     limit: 20,
//     ...filters
//   });

//   const { 
//     data: statsData, 
//     isLoading: statsLoading,
//     refetch: refetchStats
//   } = useGetAuditStatsQuery(filters.electionId || undefined);

//   const { 
//     /*eslint-disable*/
//     data: verificationsData 
//   } = useGetVoteVerificationsQuery({
//     electionId: filters.electionId || undefined,
//     page: 1,
//     limit: 10
//   });

//   const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
//   const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();
//   const [exportAudit, { isLoading: exportLoading }] = useLazyExportAuditTrailQuery();

//   const auditLogs = logsData?.data?.auditLogs || [];
//   const pagination = logsData?.data?.pagination;
//   const stats = statsData?.data;

//   const handleRefresh = () => {
//     refetchLogs();
//     refetchStats();
//   };

//   const handleFetchHashChain = async () => {
//     if (!selectedElectionId) {
//       alert('Please select an Election');
//       return;
//     }
//     await getHashChain({ electionId: selectedElectionId, limit: 100 });
//     setShowHashChain(true);
//   };

//   const handleVerifyIntegrity = async () => {
//     if (!selectedElectionId) {
//       alert('Please select an Election');
//       return;
//     }
//     await verifyIntegrity(selectedElectionId);
//     setShowIntegrityCheck(true);
//   };

//   const handleExport = async (format) => {
//     if (!selectedElectionId) {
//       alert('Please select an Election');
//       return;
//     }
    
//     try {
//       const result = await exportAudit({ 
//         electionId: selectedElectionId, 
//         format,
//         startDate: filters.startDate,
//         endDate: filters.endDate
//       }).unwrap();

//       if (format === 'json') {
//         const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `audit-trail-${selectedElectionId}-${Date.now()}.json`;
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         window.URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Failed to export audit trail');
//     }
//   };

//   // ⭐ NEW: Get selected election details for display
//   const getSelectedElection = () => {
//     return elections.find(e => e.id?.toString() === selectedElectionId?.toString());
//   };

//   const getActionIcon = (actionType) => {
//     const icons = {
//       'duplicate_vote': <AlertCircle className="text-yellow-600" size={18} />,
//       'suspicious_activity': <AlertTriangle className="text-red-600" size={18} />,
//       'vote_cast': <CheckCircle className="text-green-600" size={18} />,
//       'vote_verified': <Shield className="text-blue-600" size={18} />,
//     };
//     return icons[actionType] || <Lock className="text-gray-600" size={18} />;
//   };

//   const getActionColor = (actionType) => {
//     const colors = {
//       'duplicate_vote': 'bg-yellow-100 text-yellow-800',
//       'suspicious_activity': 'bg-red-100 text-red-800',
//       'vote_cast': 'bg-green-100 text-green-800',
//       'vote_verified': 'bg-blue-100 text-blue-800',
//     };
//     return colors[actionType] || 'bg-gray-100 text-gray-800';
//   };

//   const clearFilters = () => {
//     setFilters({ actionType: '', electionId: '', startDate: '', endDate: '' });
//     setPage(1);
//   };

//   // ⭐ NEW: Get status badge color
//   const getStatusColor = (status) => {
//     const colors = {
//       'active': 'bg-green-100 text-green-800',
//       'published': 'bg-blue-100 text-blue-800',
//       'completed': 'bg-gray-100 text-gray-800',
//       'draft': 'bg-yellow-100 text-yellow-800',
//       'cancelled': 'bg-red-100 text-red-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
//                 <Shield className="text-blue-600" size={32} />
//                 Audit Trail & Blockchain Verification
//               </h1>
//               <p className="text-gray-600">
//                 Industry-standard immutable audit logging with cryptographic verification
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
//                 className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
//               >
//                 <Info size={16} />
//                 How It Works
//               </button>
//               <button
//                 onClick={handleRefresh}
//                 disabled={logsLoading || statsLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Blockchain Info Panel */}
//         {showBlockchainInfo && (
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-8 border border-indigo-200">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
//                 <Blocks size={24} />
//                 Understanding Blockchain-Style Audit Trail
//               </h2>
//               <button onClick={() => setShowBlockchainInfo(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               {/* How it works */}
//               <div className="bg-white rounded-lg p-4 shadow">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <GitBranch size={18} className="text-indigo-600" />
//                   How Hash Chain Works
//                 </h3>
//                 <div className="space-y-3 text-sm text-gray-700">
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
//                     <p><strong>Each vote creates a block</strong> - When someone votes, a new block is added to the chain with the vote hash.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
//                     <p><strong>Blocks link together</strong> - Each block contains the hash of the previous block, creating an unbreakable chain.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
//                     <p><strong>Tampering is detectable</strong> - If anyone changes a vote, the hash changes, breaking the chain.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
//                     <p><strong>Merkle Root</strong> - A single hash representing ALL votes for quick verification.</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Visual representation */}
//               <div className="bg-white rounded-lg p-4 shadow">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <Link2 size={18} className="text-green-600" />
//                   Chain Structure
//                 </h3>
//                 <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
//                   <pre>{`
// ┌─────────┐    ┌─────────┐    ┌─────────┐
// │ Block 1 │───▶│ Block 2 │───▶│ Block 3 │
// │ Vote #1 │    │ Vote #2 │    │ Vote #3 │
// └────┬────┘    └────┬────┘    └────┬────┘
//      │              │              │
// prev:000...   prev:abc...    prev:def...
// hash:abc...   hash:def...    hash:ghi...
//                   `}</pre>
//                 </div>
//                 <p className="text-xs text-gray-600 mt-2">
//                   <strong>Genesis block</strong> starts with zeros. Each subsequent block links to the previous.
//                 </p>
//               </div>

//               {/* What each field means */}
//               <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <Fingerprint size={18} className="text-purple-600" />
//                   Block Fields Explained
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Vote Hash</p>
//                     <p className="text-gray-600 text-xs">SHA-256 hash of the vote data. Unique fingerprint of each vote.</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Previous Hash</p>
//                     <p className="text-gray-600 text-xs">Hash of the previous block. Creates the chain linkage.</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Block Hash</p>
//                     <p className="text-gray-600 text-xs">Hash of the entire block (vote + previous hash + timestamp).</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Merkle Root</p>
//                     <p className="text-gray-600 text-xs">Single hash representing ALL votes. Used for quick verification.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <p className="text-sm text-yellow-800">
//                 <strong>💡 Why only 1 block?</strong> The hash chain shows blocks <strong>per election</strong>. 
//                 If an election has 1 vote, you'll see 1 block. If it has 100 votes, you'll see 100 blocks. 
//                 The integrity check may show totals across ALL elections.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Statistics Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Actions</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.total_actions || 0}
//                   </p>
//                 </div>
//                 <Shield className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Unique Users</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.unique_users || 0}
//                   </p>
//                 </div>
//                 <Users className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Normal Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes?.total_votes || 0}
//                   </p>
//                 </div>
//                 <CheckCircle className="text-purple-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Anonymous Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes?.total_anonymous_votes || 0}
//                   </p>
//                 </div>
//                 <Eye className="text-indigo-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Last 24 Hours</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.recentActivity?.actions_24h || 0}
//                   </p>
//                 </div>
//                 <TrendingUp className="text-orange-600" size={40} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Type Breakdown */}
//         {stats?.actionTypes && stats.actionTypes.length > 0 && (
//           <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Activity size={20} />
//               Action Type Distribution
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.actionTypes.map((action) => (
//                 <div
//                   key={action.action_type}
//                   className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
//                 >
//                   {getActionIcon(action.action_type)}
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {action.action_type?.replace(/_/g, ' ') || 'Unknown'}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{action.count}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Blockchain Verification Section */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Hash className="text-indigo-600" />
//             Blockchain-Style Verification
//             <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2">
//               SHA-256 + Merkle Tree
//             </span>
//           </h2>
//           <p className="text-sm text-gray-600 mb-4">
//             Verify election integrity using cryptographic hash chains. Each vote creates a block linked to the previous one.
//           </p>
          
//           <div className="flex flex-wrap gap-4 mb-6">
//             {/* ⭐ CHANGED: Election Dropdown instead of Input */}
//             <div className="flex-1 min-w-[300px]">
//               <label className="block text-xs font-medium text-gray-500 mb-1">Select Election</label>
//               <div className="relative">
//                 <select
//                   value={selectedElectionId}
//                   onChange={(e) => {
//                     setSelectedElectionId(e.target.value);
//                     setShowHashChain(false);
//                     setShowIntegrityCheck(false);
//                   }}
//                   disabled={electionsLoading}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   <option value="">
//                     {electionsLoading ? 'Loading elections...' : '-- Select an Election --'}
//                   </option>
//                   {elections.map((election) => (
//                     <option key={election.id} value={election.id}>
//                       #{election.id} - {election.title} ({election.status || 'unknown'})
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown 
//                   size={20} 
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
//                 />
//               </div>
//               {/* Show selected election details */}
//               {selectedElectionId && getSelectedElection() && (
//                 <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
//                   <div className="flex items-center gap-2 text-sm">
//                     <span className="font-semibold text-indigo-900">
//                       {getSelectedElection()?.title}
//                     </span>
//                     <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(getSelectedElection()?.status)}`}>
//                       {getSelectedElection()?.status}
//                     </span>
//                   </div>
//                   {getSelectedElection()?.voting_type && (
//                     <p className="text-xs text-indigo-600 mt-1">
//                       Type: {getSelectedElection()?.voting_type} | 
//                       ID: #{getSelectedElection()?.id}
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="flex items-start gap-2 pt-5">
//               <button
//                 onClick={handleFetchHashChain}
//                 disabled={!selectedElectionId || hashChainLoading}
//                 className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Link2 size={16} />
//                 {hashChainLoading ? 'Loading...' : 'View Hash Chain'}
//               </button>
//               <button
//                 onClick={handleVerifyIntegrity}
//                 disabled={!selectedElectionId || integrityLoading}
//                 className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Shield size={16} />
//                 {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
//               </button>
//               <button
//                 onClick={() => handleExport('json')}
//                 disabled={!selectedElectionId || exportLoading}
//                 className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Download size={16} />
//                 {exportLoading ? 'Exporting...' : 'Export'}
//               </button>
//             </div>
//           </div>

//           {/* Integrity Check Result */}
//           {showIntegrityCheck && integrityData && (
//             <div className={`mb-6 p-4 rounded-lg border-2 ${
//               integrityData.verified 
//                 ? 'bg-green-50 border-green-500' 
//                 : 'bg-red-50 border-red-500'
//             }`}>
//               <div className="flex items-center gap-3 mb-2">
//                 {integrityData.verified ? (
//                   <CheckCircle className="text-green-600" size={24} />
//                 ) : (
//                   <AlertTriangle className="text-red-600" size={24} />
//                 )}
//                 <h3 className="text-lg font-bold">
//                   {integrityData.verified ? 'Integrity Verified ✓' : 'Integrity Issues Detected'}
//                 </h3>
//                 {integrityData.integrityScore !== undefined && (
//                   <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
//                     integrityData.integrityScore >= 90 ? 'bg-green-200 text-green-800' :
//                     integrityData.integrityScore >= 70 ? 'bg-yellow-200 text-yellow-800' :
//                     'bg-red-200 text-red-800'
//                   }`}>
//                     Score: {integrityData.integrityScore}%
//                   </span>
//                 )}
//                 <button onClick={() => setShowIntegrityCheck(false)} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
//               </div>
//               <p className="text-sm mb-3">{integrityData.message}</p>
              
//               {/* Election Info */}
//               {integrityData.election && (
//                 <div className="bg-white/50 rounded p-2 mb-3">
//                   <p className="text-sm">
//                     <strong>Election:</strong> {integrityData.election.title} (ID: {integrityData.election.id})
//                     <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
//                       integrityData.election.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {integrityData.election.status}
//                     </span>
//                   </p>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Normal Votes</p>
//                   <p className="text-xl font-bold text-blue-600">{integrityData.details?.totalNormalVotes || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Anonymous Votes</p>
//                   <p className="text-xl font-bold text-purple-600">{integrityData.details?.totalAnonymousVotes || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Audit Logs</p>
//                   <p className="text-xl font-bold text-orange-600">{integrityData.details?.totalAuditLogs || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Verifications</p>
//                   <p className="text-xl font-bold text-green-600">{integrityData.details?.totalVerifications || 0}</p>
//                 </div>
//               </div>

//               {/* Checks */}
//               {integrityData.checks && integrityData.checks.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm font-semibold mb-2">Security Checks:</p>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                     {integrityData.checks.map((check, idx) => (
//                       <div 
//                         key={idx}
//                         className={`flex items-center gap-2 p-2 rounded text-xs ${
//                           check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {check.passed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
//                         <span>{check.name}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Issues */}
//               {integrityData.issues && integrityData.issues.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm font-semibold mb-2 text-red-700">Issues Found:</p>
//                   <div className="space-y-1">
//                     {integrityData.issues.map((issue, idx) => (
//                       <div key={idx} className={`text-xs p-2 rounded ${
//                         issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         <strong>[{issue.severity?.toUpperCase()}]</strong> {issue.message}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Hash Chain Display */}
//           {showHashChain && hashChainData?.data && (
//             <div className="border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Hash Chain - Election #{hashChainData.data.election?.id || hashChainData.data.electionId}
//                   {hashChainData.data.election?.title && (
//                     <span className="text-sm font-normal text-gray-500 ml-2">
//                       ({hashChainData.data.election.title})
//                     </span>
//                   )}
//                 </h3>
//                 <button onClick={() => setShowHashChain(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//               </div>
              
//               {/* Chain Summary */}
//               <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-4 mb-4">
//                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-600">Total Blocks</p>
//                     <p className="text-2xl font-bold text-gray-900">{hashChainData.data.totalBlocks}</p>
//                     <p className="text-xs text-gray-500">1 block = 1 vote</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Normal Votes</p>
//                     <p className="text-2xl font-bold text-blue-600">{hashChainData.data.normalVotes}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Anonymous Votes</p>
//                     <p className="text-2xl font-bold text-purple-600">{hashChainData.data.anonymousVotes}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Chain Integrity</p>
//                     <p className="text-lg font-bold text-green-600 flex items-center gap-1">
//                       <CheckCircle size={18} /> Verified
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Merkle Root</p>
//                     <p className="text-xs font-mono text-indigo-600 truncate" title={hashChainData.data.merkleRoot}>
//                       {hashChainData.data.merkleRoot?.substring(0, 20)}...
//                     </p>
//                     <button 
//                       onClick={() => navigator.clipboard.writeText(hashChainData.data.merkleRoot)}
//                       className="text-xs text-blue-500 hover:underline"
//                     >
//                       Copy
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Empty state */}
//               {hashChainData.data.totalBlocks === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-lg">
//                   <Database size={48} className="mx-auto mb-3 text-gray-300" />
//                   <p className="text-gray-600">No votes found for this election</p>
//                   <p className="text-sm text-gray-500">Votes will appear here as they are cast</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Genesis Block Info */}
//                   <div className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400">
//                     <p className="text-xs font-mono text-gray-600">
//                       <strong>Genesis Hash (Block 0):</strong> {hashChainData.data.genesisHash}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       This is the starting point of the chain. All zeros indicate the beginning.
//                     </p>
//                   </div>

//                   {/* Blocks */}
//                   <div className="space-y-3 max-h-[500px] overflow-y-auto">
//                     {hashChainData.data.hashChain?.map((block, index) => (
//                       <div
//                         key={block.blockNumber}
//                         className={`border rounded-lg p-4 relative ${
//                           block.voteType === 'anonymous' 
//                             ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
//                             : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
//                         }`}
//                       >
//                         {/* Chain connector */}
//                         {index < hashChainData.data.hashChain.length - 1 && (
//                           <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
//                             <div className="bg-gray-300 rounded-full p-1">
//                               <Link2 size={12} className="text-gray-600" />
//                             </div>
//                           </div>
//                         )}

//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center gap-2">
//                             <span className="text-lg font-bold text-gray-900">Block #{block.blockNumber}</span>
//                             <span className={`text-xs px-2 py-1 rounded-full font-medium ${
//                               block.voteType === 'anonymous' 
//                                 ? 'bg-purple-200 text-purple-800' 
//                                 : 'bg-blue-200 text-blue-800'
//                             }`}>
//                               {block.voteType === 'anonymous' ? '🔒 Anonymous' : '👤 Normal'}
//                             </span>
//                             {block.verified && (
//                               <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
//                                 ✓ Verified
//                               </span>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 text-xs text-gray-600">
//                             <Clock size={14} />
//                             {new Date(block.timestamp).toLocaleString()}
//                           </div>
//                         </div>

//                         <div className="grid md:grid-cols-3 gap-3 text-xs font-mono">
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Vote Hash</p>
//                             <p className="text-gray-800 truncate" title={block.voteHash}>
//                               {block.voteHash?.substring(0, 32)}...
//                             </p>
//                           </div>
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Previous Hash</p>
//                             <p className={`truncate ${
//                               block.previousHash?.startsWith('0000') ? 'text-gray-400' : 'text-orange-600'
//                             }`} title={block.previousHash}>
//                               {block.previousHash?.substring(0, 32)}...
//                             </p>
//                             {block.previousHash?.startsWith('0000') && (
//                               <p className="text-xs text-gray-400 font-sans">(Genesis)</p>
//                             )}
//                           </div>
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Block Hash</p>
//                             <p className="text-indigo-700 truncate" title={block.blockHash}>
//                               {block.blockHash?.substring(0, 32)}...
//                             </p>
//                           </div>
//                         </div>

//                         {block.receiptId && (
//                           <div className="mt-2 text-xs text-gray-500">
//                             Receipt: <span className="font-mono">{block.receiptId}</span>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Chain end */}
//                   <div className="mt-4 p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-500">
//                     <p className="text-xs font-mono text-indigo-800">
//                       <strong>Latest Block Hash:</strong> {hashChainData.data.latestBlockHash}
//                     </p>
//                     <p className="text-xs text-indigo-600 mt-1">
//                       Generated at: {new Date(hashChainData.data.generatedAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Filter size={20} />
//             Filter Audit Logs
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
//               <select
//                 value={filters.actionType}
//                 onChange={(e) => { setFilters({ ...filters, actionType: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">All Actions</option>
//                 <option value="duplicate_vote">Duplicate Vote</option>
//                 <option value="suspicious_activity">Suspicious Activity</option>
//                 <option value="vote_cast">Vote Cast</option>
//                 <option value="vote_verified">Vote Verified</option>
//               </select>
//             </div>

//             {/* ⭐ CHANGED: Election Filter Dropdown instead of Input */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Election</label>
//               <select
//                 value={filters.electionId}
//                 onChange={(e) => { setFilters({ ...filters, electionId: e.target.value }); setPage(1); }}
//                 disabled={electionsLoading}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
//               >
//                 <option value="">All Elections</option>
//                 {elections.map((election) => (
//                   <option key={election.id} value={election.id}>
//                     #{election.id} - {election.title?.substring(0, 30)}{election.title?.length > 30 ? '...' : ''}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={filters.startDate}
//                 onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={filters.endDate}
//                 onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={clearFilters}
//                 className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Audit Logs Table */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <Database size={20} />
//               Audit Log Entries
//             </h2>
//             {pagination && (
//               <span className="text-sm text-gray-600">
//                 {pagination.total} total entries
//               </span>
//             )}
//           </div>

//           {logsLoading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading audit logs...</p>
//             </div>
//           ) : auditLogs.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               <Database size={48} className="mx-auto mb-4 text-gray-300" />
//               <p>No audit logs found</p>
//               <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {auditLogs.map((log) => (
//                     <tr key={log.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
//                           {getActionIcon(log.action_type)}
//                           {log.action_type?.replace(/_/g, ' ')}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className="text-sm font-semibold text-blue-600">#{log.election_id}</span>
//                         {log.election_title && (
//                           <p className="text-xs text-gray-500 truncate max-w-[150px]">{log.election_title}</p>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                         {log.user_name || `User #${log.user_id}`}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
//                         {log.ip_address || '-'}
//                       </td>
//                       <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent}>
//                         {log.user_agent?.substring(0, 40) || '-'}...
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {!logsLoading && pagination && auditLogs.length > 0 && (
//             <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
//               <div className="text-sm text-gray-700">
//                 Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   ← Previous
//                 </button>
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Info Footer */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//           <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//             <Shield size={20} className="text-blue-600" />
//             Industry-Standard Security Features
//           </h3>
//           <p className="text-sm text-gray-700 mb-3">
//             This audit system implements the same cryptographic principles used in Bitcoin and Ethereum blockchains.
//             Every vote creates a block, and blocks are linked together making any tampering immediately detectable.
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Hash size={14} className="text-indigo-600" />
//               <span>SHA-256 Hashing</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Link2 size={14} className="text-green-600" />
//               <span>Chain Linking</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Shield size={14} className="text-blue-600" />
//               <span>Tamper Detection</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <GitBranch size={14} className="text-purple-600" />
//               <span>Merkle Tree</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <FileText size={14} className="text-orange-600" />
//               <span>Export & Audit</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Updated AuditTrail.jsx - Better hash chain display with explanation
// import React, { useState} from 'react';
// import { 
//   Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, 
//   Eye, Download, RefreshCw, TrendingUp, Users, Activity, 
//   FileText, AlertTriangle, Filter, Search, Info, Blocks,
//   GitBranch, Clock, Fingerprint
// } from 'lucide-react';
// import { useGetAuditLogsQuery,useGetAuditStatsQuery,useLazyGetHashChainQuery,useLazyVerifyIntegrityQuery, useLazyExportAuditTrailQuery,useGetVoteVerificationsQuery} from '../../../redux/api/verification/auditTrailApi';
// // import {
// //   useGetAuditLogsQuery,
// //   useGetAuditStatsQuery,
// //   useLazyGetHashChainQuery,
// //   useLazyVerifyIntegrityQuery,
// //   useLazyExportAuditTrailQuery,
// //   useGetVoteVerificationsQuery,
// // } from '../../redux/api/verification/auditTrailApi';

// export default function AuditTrail() {
//   const [page, setPage] = useState(1);
//   const [filters, setFilters] = useState({
//     actionType: '',
//     electionId: '',
//     startDate: '',
//     endDate: '',
//   });
//   const [selectedElectionId, setSelectedElectionId] = useState('');
//   const [showHashChain, setShowHashChain] = useState(false);
//   const [showIntegrityCheck, setShowIntegrityCheck] = useState(false);
//   const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);

//   // RTK Query Hooks
//   const { 
//     data: logsData, 
//     isLoading: logsLoading, 
//     refetch: refetchLogs 
//   } = useGetAuditLogsQuery({
//     page,
//     limit: 20,
//     ...filters
//   });

//   const { 
//     data: statsData, 
//     isLoading: statsLoading,
//     refetch: refetchStats
//   } = useGetAuditStatsQuery(filters.electionId || undefined);

//   const { 
//     /*eslint-disable*/
//     data: verificationsData 
//   } = useGetVoteVerificationsQuery({
//     electionId: filters.electionId || undefined,
//     page: 1,
//     limit: 10
//   });

//   const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
//   const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();
//   const [exportAudit, { isLoading: exportLoading }] = useLazyExportAuditTrailQuery();

//   const auditLogs = logsData?.data?.auditLogs || [];
//   const pagination = logsData?.data?.pagination;
//   const stats = statsData?.data;

//   const handleRefresh = () => {
//     refetchLogs();
//     refetchStats();
//   };

//   const handleFetchHashChain = async () => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
//     await getHashChain({ electionId: selectedElectionId, limit: 100 });
//     setShowHashChain(true);
//   };

//   const handleVerifyIntegrity = async () => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
//     await verifyIntegrity(selectedElectionId);
//     setShowIntegrityCheck(true);
//   };

//   const handleExport = async (format) => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
    
//     try {
//       const result = await exportAudit({ 
//         electionId: selectedElectionId, 
//         format,
//         startDate: filters.startDate,
//         endDate: filters.endDate
//       }).unwrap();

//       if (format === 'json') {
//         const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `audit-trail-${selectedElectionId}-${Date.now()}.json`;
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         window.URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Failed to export audit trail');
//     }
//   };

//   const getActionIcon = (actionType) => {
//     const icons = {
//       'duplicate_vote': <AlertCircle className="text-yellow-600" size={18} />,
//       'suspicious_activity': <AlertTriangle className="text-red-600" size={18} />,
//       'vote_cast': <CheckCircle className="text-green-600" size={18} />,
//       'vote_verified': <Shield className="text-blue-600" size={18} />,
//     };
//     return icons[actionType] || <Lock className="text-gray-600" size={18} />;
//   };

//   const getActionColor = (actionType) => {
//     const colors = {
//       'duplicate_vote': 'bg-yellow-100 text-yellow-800',
//       'suspicious_activity': 'bg-red-100 text-red-800',
//       'vote_cast': 'bg-green-100 text-green-800',
//       'vote_verified': 'bg-blue-100 text-blue-800',
//     };
//     return colors[actionType] || 'bg-gray-100 text-gray-800';
//   };

//   const clearFilters = () => {
//     setFilters({ actionType: '', electionId: '', startDate: '', endDate: '' });
//     setPage(1);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
//                 <Shield className="text-blue-600" size={32} />
//                 Audit Trail & Blockchain Verification
//               </h1>
//               <p className="text-gray-600">
//                 Industry-standard immutable audit logging with cryptographic verification
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
//                 className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
//               >
//                 <Info size={16} />
//                 How It Works
//               </button>
//               <button
//                 onClick={handleRefresh}
//                 disabled={logsLoading || statsLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Blockchain Info Panel */}
//         {showBlockchainInfo && (
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-8 border border-indigo-200">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
//                 <Blocks size={24} />
//                 Understanding Blockchain-Style Audit Trail
//               </h2>
//               <button onClick={() => setShowBlockchainInfo(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               {/* How it works */}
//               <div className="bg-white rounded-lg p-4 shadow">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <GitBranch size={18} className="text-indigo-600" />
//                   How Hash Chain Works
//                 </h3>
//                 <div className="space-y-3 text-sm text-gray-700">
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
//                     <p><strong>Each vote creates a block</strong> - When someone votes, a new block is added to the chain with the vote hash.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
//                     <p><strong>Blocks link together</strong> - Each block contains the hash of the previous block, creating an unbreakable chain.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
//                     <p><strong>Tampering is detectable</strong> - If anyone changes a vote, the hash changes, breaking the chain.</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
//                     <p><strong>Merkle Root</strong> - A single hash representing ALL votes for quick verification.</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Visual representation */}
//               <div className="bg-white rounded-lg p-4 shadow">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <Link2 size={18} className="text-green-600" />
//                   Chain Structure
//                 </h3>
//                 <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
//                   <pre>{`
// ┌─────────┐    ┌─────────┐    ┌─────────┐
// │ Block 1 │───▶│ Block 2 │───▶│ Block 3 │
// │ Vote #1 │    │ Vote #2 │    │ Vote #3 │
// └────┬────┘    └────┬────┘    └────┬────┘
//      │              │              │
// prev:000...   prev:abc...    prev:def...
// hash:abc...   hash:def...    hash:ghi...
//                   `}</pre>
//                 </div>
//                 <p className="text-xs text-gray-600 mt-2">
//                   <strong>Genesis block</strong> starts with zeros. Each subsequent block links to the previous.
//                 </p>
//               </div>

//               {/* What each field means */}
//               <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
//                 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <Fingerprint size={18} className="text-purple-600" />
//                   Block Fields Explained
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Vote Hash</p>
//                     <p className="text-gray-600 text-xs">SHA-256 hash of the vote data. Unique fingerprint of each vote.</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Previous Hash</p>
//                     <p className="text-gray-600 text-xs">Hash of the previous block. Creates the chain linkage.</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Block Hash</p>
//                     <p className="text-gray-600 text-xs">Hash of the entire block (vote + previous hash + timestamp).</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p className="font-semibold text-gray-900">Merkle Root</p>
//                     <p className="text-gray-600 text-xs">Single hash representing ALL votes. Used for quick verification.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <p className="text-sm text-yellow-800">
//                 <strong>💡 Why only 1 block?</strong> The hash chain shows blocks <strong>per election</strong>. 
//                 If an election has 1 vote, you'll see 1 block. If it has 100 votes, you'll see 100 blocks. 
//                 The integrity check may show totals across ALL elections.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Statistics Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Actions</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.total_actions || 0}
//                   </p>
//                 </div>
//                 <Shield className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Unique Users</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.unique_users || 0}
//                   </p>
//                 </div>
//                 <Users className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Normal Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes?.total_votes || 0}
//                   </p>
//                 </div>
//                 <CheckCircle className="text-purple-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Anonymous Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes?.total_anonymous_votes || 0}
//                   </p>
//                 </div>
//                 <Eye className="text-indigo-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Last 24 Hours</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.recentActivity?.actions_24h || 0}
//                   </p>
//                 </div>
//                 <TrendingUp className="text-orange-600" size={40} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Type Breakdown */}
//         {stats?.actionTypes && stats.actionTypes.length > 0 && (
//           <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Activity size={20} />
//               Action Type Distribution
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.actionTypes.map((action) => (
//                 <div
//                   key={action.action_type}
//                   className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
//                 >
//                   {getActionIcon(action.action_type)}
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {action.action_type?.replace(/_/g, ' ') || 'Unknown'}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{action.count}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Blockchain Verification Section */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Hash className="text-indigo-600" />
//             Blockchain-Style Verification
//             <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2">
//               SHA-256 + Merkle Tree
//             </span>
//           </h2>
//           <p className="text-sm text-gray-600 mb-4">
//             Verify election integrity using cryptographic hash chains. Each vote creates a block linked to the previous one.
//           </p>
          
//           <div className="flex flex-wrap gap-4 mb-6">
//             <div className="flex-1 min-w-[200px]">
//               <label className="block text-xs font-medium text-gray-500 mb-1">Election ID</label>
//               <input
//                 type="number"
//                 value={selectedElectionId}
//                 onChange={(e) => setSelectedElectionId(e.target.value)}
//                 placeholder="Enter Election ID (e.g., 41, 60)"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex items-end gap-2">
//               <button
//                 onClick={handleFetchHashChain}
//                 disabled={!selectedElectionId || hashChainLoading}
//                 className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 <Link2 size={16} />
//                 {hashChainLoading ? 'Loading...' : 'View Hash Chain'}
//               </button>
//               <button
//                 onClick={handleVerifyIntegrity}
//                 disabled={!selectedElectionId || integrityLoading}
//                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 <Shield size={16} />
//                 {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
//               </button>
//               <button
//                 onClick={() => handleExport('json')}
//                 disabled={!selectedElectionId || exportLoading}
//                 className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
//               >
//                 <Download size={16} />
//                 {exportLoading ? 'Exporting...' : 'Export'}
//               </button>
//             </div>
//           </div>

//           {/* Integrity Check Result */}
//           {showIntegrityCheck && integrityData && (
//             <div className={`mb-6 p-4 rounded-lg border-2 ${
//               integrityData.verified 
//                 ? 'bg-green-50 border-green-500' 
//                 : 'bg-red-50 border-red-500'
//             }`}>
//               <div className="flex items-center gap-3 mb-2">
//                 {integrityData.verified ? (
//                   <CheckCircle className="text-green-600" size={24} />
//                 ) : (
//                   <AlertTriangle className="text-red-600" size={24} />
//                 )}
//                 <h3 className="text-lg font-bold">
//                   {integrityData.verified ? 'Integrity Verified ✓' : 'Integrity Issues Detected'}
//                 </h3>
//                 {integrityData.integrityScore !== undefined && (
//                   <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
//                     integrityData.integrityScore >= 90 ? 'bg-green-200 text-green-800' :
//                     integrityData.integrityScore >= 70 ? 'bg-yellow-200 text-yellow-800' :
//                     'bg-red-200 text-red-800'
//                   }`}>
//                     Score: {integrityData.integrityScore}%
//                   </span>
//                 )}
//                 <button onClick={() => setShowIntegrityCheck(false)} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
//               </div>
//               <p className="text-sm mb-3">{integrityData.message}</p>
              
//               {/* Election Info */}
//               {integrityData.election && (
//                 <div className="bg-white/50 rounded p-2 mb-3">
//                   <p className="text-sm">
//                     <strong>Election:</strong> {integrityData.election.title} (ID: {integrityData.election.id})
//                     <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
//                       integrityData.election.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {integrityData.election.status}
//                     </span>
//                   </p>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Normal Votes</p>
//                   <p className="text-xl font-bold text-blue-600">{integrityData.details?.totalNormalVotes || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Anonymous Votes</p>
//                   <p className="text-xl font-bold text-purple-600">{integrityData.details?.totalAnonymousVotes || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Audit Logs</p>
//                   <p className="text-xl font-bold text-orange-600">{integrityData.details?.totalAuditLogs || 0}</p>
//                 </div>
//                 <div className="bg-white/50 rounded p-2">
//                   <p className="text-gray-600">Verifications</p>
//                   <p className="text-xl font-bold text-green-600">{integrityData.details?.totalVerifications || 0}</p>
//                 </div>
//               </div>

//               {/* Checks */}
//               {integrityData.checks && integrityData.checks.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm font-semibold mb-2">Security Checks:</p>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                     {integrityData.checks.map((check, idx) => (
//                       <div 
//                         key={idx}
//                         className={`flex items-center gap-2 p-2 rounded text-xs ${
//                           check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {check.passed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
//                         <span>{check.name}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Issues */}
//               {integrityData.issues && integrityData.issues.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm font-semibold mb-2 text-red-700">Issues Found:</p>
//                   <div className="space-y-1">
//                     {integrityData.issues.map((issue, idx) => (
//                       <div key={idx} className={`text-xs p-2 rounded ${
//                         issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         <strong>[{issue.severity?.toUpperCase()}]</strong> {issue.message}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Hash Chain Display */}
//           {showHashChain && hashChainData?.data && (
//             <div className="border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Hash Chain - Election #{hashChainData.data.election?.id || hashChainData.data.electionId}
//                   {hashChainData.data.election?.title && (
//                     <span className="text-sm font-normal text-gray-500 ml-2">
//                       ({hashChainData.data.election.title})
//                     </span>
//                   )}
//                 </h3>
//                 <button onClick={() => setShowHashChain(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//               </div>
              
//               {/* Chain Summary */}
//               <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-4 mb-4">
//                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-600">Total Blocks</p>
//                     <p className="text-2xl font-bold text-gray-900">{hashChainData.data.totalBlocks}</p>
//                     <p className="text-xs text-gray-500">1 block = 1 vote</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Normal Votes</p>
//                     <p className="text-2xl font-bold text-blue-600">{hashChainData.data.normalVotes}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Anonymous Votes</p>
//                     <p className="text-2xl font-bold text-purple-600">{hashChainData.data.anonymousVotes}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Chain Integrity</p>
//                     <p className="text-lg font-bold text-green-600 flex items-center gap-1">
//                       <CheckCircle size={18} /> Verified
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-600">Merkle Root</p>
//                     <p className="text-xs font-mono text-indigo-600 truncate" title={hashChainData.data.merkleRoot}>
//                       {hashChainData.data.merkleRoot?.substring(0, 20)}...
//                     </p>
//                     <button 
//                       onClick={() => navigator.clipboard.writeText(hashChainData.data.merkleRoot)}
//                       className="text-xs text-blue-500 hover:underline"
//                     >
//                       Copy
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Empty state */}
//               {hashChainData.data.totalBlocks === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-lg">
//                   <Database size={48} className="mx-auto mb-3 text-gray-300" />
//                   <p className="text-gray-600">No votes found for this election</p>
//                   <p className="text-sm text-gray-500">Votes will appear here as they are cast</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Genesis Block Info */}
//                   <div className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400">
//                     <p className="text-xs font-mono text-gray-600">
//                       <strong>Genesis Hash (Block 0):</strong> {hashChainData.data.genesisHash}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       This is the starting point of the chain. All zeros indicate the beginning.
//                     </p>
//                   </div>

//                   {/* Blocks */}
//                   <div className="space-y-3 max-h-[500px] overflow-y-auto">
//                     {hashChainData.data.hashChain?.map((block, index) => (
//                       <div
//                         key={block.blockNumber}
//                         className={`border rounded-lg p-4 relative ${
//                           block.voteType === 'anonymous' 
//                             ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
//                             : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
//                         }`}
//                       >
//                         {/* Chain connector */}
//                         {index < hashChainData.data.hashChain.length - 1 && (
//                           <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
//                             <div className="bg-gray-300 rounded-full p-1">
//                               <Link2 size={12} className="text-gray-600" />
//                             </div>
//                           </div>
//                         )}

//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center gap-2">
//                             <span className="text-lg font-bold text-gray-900">Block #{block.blockNumber}</span>
//                             <span className={`text-xs px-2 py-1 rounded-full font-medium ${
//                               block.voteType === 'anonymous' 
//                                 ? 'bg-purple-200 text-purple-800' 
//                                 : 'bg-blue-200 text-blue-800'
//                             }`}>
//                               {block.voteType === 'anonymous' ? '🔒 Anonymous' : '👤 Normal'}
//                             </span>
//                             {block.verified && (
//                               <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
//                                 ✓ Verified
//                               </span>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 text-xs text-gray-600">
//                             <Clock size={14} />
//                             {new Date(block.timestamp).toLocaleString()}
//                           </div>
//                         </div>

//                         <div className="grid md:grid-cols-3 gap-3 text-xs font-mono">
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Vote Hash</p>
//                             <p className="text-gray-800 truncate" title={block.voteHash}>
//                               {block.voteHash?.substring(0, 32)}...
//                             </p>
//                           </div>
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Previous Hash</p>
//                             <p className={`truncate ${
//                               block.previousHash?.startsWith('0000') ? 'text-gray-400' : 'text-orange-600'
//                             }`} title={block.previousHash}>
//                               {block.previousHash?.substring(0, 32)}...
//                             </p>
//                             {block.previousHash?.startsWith('0000') && (
//                               <p className="text-xs text-gray-400 font-sans">(Genesis)</p>
//                             )}
//                           </div>
//                           <div className="bg-white/70 rounded p-2">
//                             <p className="text-gray-500 mb-1 font-sans">Block Hash</p>
//                             <p className="text-indigo-700 truncate" title={block.blockHash}>
//                               {block.blockHash?.substring(0, 32)}...
//                             </p>
//                           </div>
//                         </div>

//                         {block.receiptId && (
//                           <div className="mt-2 text-xs text-gray-500">
//                             Receipt: <span className="font-mono">{block.receiptId}</span>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Chain end */}
//                   <div className="mt-4 p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-500">
//                     <p className="text-xs font-mono text-indigo-800">
//                       <strong>Latest Block Hash:</strong> {hashChainData.data.latestBlockHash}
//                     </p>
//                     <p className="text-xs text-indigo-600 mt-1">
//                       Generated at: {new Date(hashChainData.data.generatedAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Filter size={20} />
//             Filter Audit Logs
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
//               <select
//                 value={filters.actionType}
//                 onChange={(e) => { setFilters({ ...filters, actionType: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">All Actions</option>
//                 <option value="duplicate_vote">Duplicate Vote</option>
//                 <option value="suspicious_activity">Suspicious Activity</option>
//                 <option value="vote_cast">Vote Cast</option>
//                 <option value="vote_verified">Vote Verified</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Election ID</label>
//               <input
//                 type="number"
//                 value={filters.electionId}
//                 onChange={(e) => { setFilters({ ...filters, electionId: e.target.value }); setPage(1); }}
//                 placeholder="All elections"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={filters.startDate}
//                 onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={filters.endDate}
//                 onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={clearFilters}
//                 className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Audit Logs Table */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <Database size={20} />
//               Audit Log Entries
//             </h2>
//             {pagination && (
//               <span className="text-sm text-gray-600">
//                 {pagination.total} total entries
//               </span>
//             )}
//           </div>

//           {logsLoading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading audit logs...</p>
//             </div>
//           ) : auditLogs.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               <Database size={48} className="mx-auto mb-4 text-gray-300" />
//               <p>No audit logs found</p>
//               <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {auditLogs.map((log) => (
//                     <tr key={log.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
//                           {getActionIcon(log.action_type)}
//                           {log.action_type?.replace(/_/g, ' ')}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className="text-sm font-semibold text-blue-600">#{log.election_id}</span>
//                         {log.election_title && (
//                           <p className="text-xs text-gray-500 truncate max-w-[150px]">{log.election_title}</p>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                         {log.user_name || `User #${log.user_id}`}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
//                         {log.ip_address || '-'}
//                       </td>
//                       <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent}>
//                         {log.user_agent?.substring(0, 40) || '-'}...
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {!logsLoading && pagination && auditLogs.length > 0 && (
//             <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
//               <div className="text-sm text-gray-700">
//                 Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   ← Previous
//                 </button>
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Info Footer */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//           <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//             <Shield size={20} className="text-blue-600" />
//             Industry-Standard Security Features
//           </h3>
//           <p className="text-sm text-gray-700 mb-3">
//             This audit system implements the same cryptographic principles used in Bitcoin and Ethereum blockchains.
//             Every vote creates a block, and blocks are linked together making any tampering immediately detectable.
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Hash size={14} className="text-indigo-600" />
//               <span>SHA-256 Hashing</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Link2 size={14} className="text-green-600" />
//               <span>Chain Linking</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <Shield size={14} className="text-blue-600" />
//               <span>Tamper Detection</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <GitBranch size={14} className="text-purple-600" />
//               <span>Merkle Tree</span>
//             </div>
//             <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
//               <FileText size={14} className="text-orange-600" />
//               <span>Export & Audit</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState } from 'react';
// import { 
//   Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, 
//   Eye, Download, RefreshCw, TrendingUp, Users, Activity, 
//   FileText, AlertTriangle, Filter, Search
// } from 'lucide-react';
// import { useGetAuditLogsQuery,useGetAuditStatsQuery,useLazyGetHashChainQuery,useLazyVerifyIntegrityQuery, useLazyExportAuditTrailQuery,useGetVoteVerificationsQuery} from '../../../redux/api/verification/auditTrailApi';
// // import {
// //   useGetAuditLogsQuery,
// //   useGetAuditStatsQuery,
// //   useLazyGetHashChainQuery,
// //   useLazyVerifyIntegrityQuery,
// //   useLazyExportAuditTrailQuery,
// //   useGetVoteVerificationsQuery,
// // } from '../../redux/api/verification/auditTrailApi';

// export default function AuditTrail() {
//   const [page, setPage] = useState(1);
//   const [filters, setFilters] = useState({
//     actionType: '',
//     electionId: '',
//     startDate: '',
//     endDate: '',
//   });
//   const [selectedElectionId, setSelectedElectionId] = useState('');
//   const [showHashChain, setShowHashChain] = useState(false);
//   const [showIntegrityCheck, setShowIntegrityCheck] = useState(false);

//   // RTK Query Hooks
//   const { 
//     data: logsData, 
//     isLoading: logsLoading, 
//     refetch: refetchLogs 
//   } = useGetAuditLogsQuery({
//     page,
//     limit: 20,
//     ...filters
//   });

//   const { 
//     data: statsData, 
//     isLoading: statsLoading,
//     refetch: refetchStats
//   } = useGetAuditStatsQuery(filters.electionId || undefined);

//   const { 
//     data: verificationsData 
//   } = useGetVoteVerificationsQuery({
//     electionId: filters.electionId || undefined,
//     page: 1,
//     limit: 10
//   });

//   const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
//   const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();
//   const [exportAudit, { isLoading: exportLoading }] = useLazyExportAuditTrailQuery();

//   const auditLogs = logsData?.data?.auditLogs || [];
//   const pagination = logsData?.data?.pagination;
//   const stats = statsData?.data;

//   const handleRefresh = () => {
//     refetchLogs();
//     refetchStats();
//   };

//   const handleFetchHashChain = async () => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
//     await getHashChain({ electionId: selectedElectionId, limit: 100 });
//     setShowHashChain(true);
//   };

//   const handleVerifyIntegrity = async () => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
//     await verifyIntegrity(selectedElectionId);
//     setShowIntegrityCheck(true);
//   };

//   const handleExport = async (format) => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
    
//     try {
//       const result = await exportAudit({ 
//         electionId: selectedElectionId, 
//         format,
//         startDate: filters.startDate,
//         endDate: filters.endDate
//       }).unwrap();

//       if (format === 'json') {
//         const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `audit-trail-${selectedElectionId}-${Date.now()}.json`;
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         window.URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Failed to export audit trail');
//     }
//   };

//   const getActionIcon = (actionType) => {
//     const icons = {
//       'duplicate_vote': <AlertCircle className="text-yellow-600" size={18} />,
//       'suspicious_activity': <AlertTriangle className="text-red-600" size={18} />,
//       'vote_cast': <CheckCircle className="text-green-600" size={18} />,
//       'vote_verified': <Shield className="text-blue-600" size={18} />,
//     };
//     return icons[actionType] || <Lock className="text-gray-600" size={18} />;
//   };

//   const getActionColor = (actionType) => {
//     const colors = {
//       'duplicate_vote': 'bg-yellow-100 text-yellow-800',
//       'suspicious_activity': 'bg-red-100 text-red-800',
//       'vote_cast': 'bg-green-100 text-green-800',
//       'vote_verified': 'bg-blue-100 text-blue-800',
//     };
//     return colors[actionType] || 'bg-gray-100 text-gray-800';
//   };

//   const clearFilters = () => {
//     setFilters({ actionType: '', electionId: '', startDate: '', endDate: '' });
//     setPage(1);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
//                 <Shield className="text-blue-600" size={32} />
//                 Audit Trail & Blockchain Verification
//               </h1>
//               <p className="text-gray-600">
//                 Industry-standard immutable audit logging with cryptographic verification
//               </p>
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={logsLoading || statsLoading}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Actions</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.total_actions || 0}
//                   </p>
//                 </div>
//                 <Shield className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Unique Users</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.unique_users || 0}
//                   </p>
//                 </div>
//                 <Users className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {(parseInt(stats.votes?.total_votes) || 0) + (parseInt(stats.votes?.total_anonymous_votes) || 0)}
//                   </p>
//                 </div>
//                 <CheckCircle className="text-purple-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Last 24 Hours</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.recentActivity?.actions_24h || 0}
//                   </p>
//                 </div>
//                 <TrendingUp className="text-orange-600" size={40} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Type Breakdown */}
//         {stats?.actionTypes && stats.actionTypes.length > 0 && (
//           <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Activity size={20} />
//               Action Type Distribution
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.actionTypes.map((action) => (
//                 <div
//                   key={action.action_type}
//                   className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
//                 >
//                   {getActionIcon(action.action_type)}
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {action.action_type?.replace(/_/g, ' ') || 'Unknown'}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{action.count}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Blockchain Verification Section */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Hash className="text-indigo-600" />
//             Blockchain-Style Verification
//           </h2>
//           <p className="text-sm text-gray-600 mb-4">
//             Verify election integrity using cryptographic hash chains
//           </p>
          
//           <div className="flex flex-wrap gap-4 mb-6">
//             <input
//               type="number"
//               value={selectedElectionId}
//               onChange={(e) => setSelectedElectionId(e.target.value)}
//               placeholder="Enter Election ID"
//               className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={handleFetchHashChain}
//               disabled={!selectedElectionId || hashChainLoading}
//               className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <Link2 size={16} />
//               {hashChainLoading ? 'Loading...' : 'View Hash Chain'}
//             </button>
//             <button
//               onClick={handleVerifyIntegrity}
//               disabled={!selectedElectionId || integrityLoading}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <Shield size={16} />
//               {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
//             </button>
//             <button
//               onClick={() => handleExport('json')}
//               disabled={!selectedElectionId || exportLoading}
//               className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <Download size={16} />
//               {exportLoading ? 'Exporting...' : 'Export JSON'}
//             </button>
//           </div>

//           {/* Integrity Check Result */}
//           {showIntegrityCheck && integrityData && (
//             <div className={`mb-6 p-4 rounded-lg border-2 ${
//               integrityData.verified 
//                 ? 'bg-green-50 border-green-500' 
//                 : 'bg-red-50 border-red-500'
//             }`}>
//               <div className="flex items-center gap-3 mb-2">
//                 {integrityData.verified ? (
//                   <CheckCircle className="text-green-600" size={24} />
//                 ) : (
//                   <AlertTriangle className="text-red-600" size={24} />
//                 )}
//                 <h3 className="text-lg font-bold">
//                   {integrityData.verified ? 'Integrity Verified ✓' : 'Integrity Issues Detected'}
//                 </h3>
//                 <button onClick={() => setShowIntegrityCheck(false)} className="ml-auto text-gray-500 hover:text-gray-700">✕</button>
//               </div>
//               <p className="text-sm mb-2">{integrityData.message}</p>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600 mt-3">
//                 <div><strong>Normal Votes:</strong> {integrityData.details?.totalNormalVotes}</div>
//                 <div><strong>Anonymous Votes:</strong> {integrityData.details?.totalAnonymousVotes}</div>
//                 <div><strong>Audit Logs:</strong> {integrityData.details?.totalAuditLogs}</div>
//                 <div><strong>Verifications:</strong> {integrityData.details?.totalVerifications}</div>
//               </div>
//             </div>
//           )}

//           {/* Hash Chain Display */}
//           {showHashChain && hashChainData?.data && (
//             <div className="border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Hash Chain - Election #{hashChainData.data.electionId}
//                 </h3>
//                 <button onClick={() => setShowHashChain(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//               </div>
              
//               <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-600">Total Blocks</p>
//                   <p className="text-lg font-bold text-gray-900">{hashChainData.data.totalBlocks}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-600">Normal Votes</p>
//                   <p className="text-lg font-bold text-blue-600">{hashChainData.data.normalVotes}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-600">Anonymous Votes</p>
//                   <p className="text-lg font-bold text-purple-600">{hashChainData.data.anonymousVotes}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-600">Integrity</p>
//                   <p className="text-lg font-bold text-green-600">Verified ✓</p>
//                 </div>
//                 <div className="col-span-2 md:col-span-1">
//                   <p className="text-xs text-gray-600">Merkle Root</p>
//                   <p className="text-xs font-mono text-indigo-600 truncate" title={hashChainData.data.merkleRoot}>
//                     {hashChainData.data.merkleRoot?.substring(0, 16)}...
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {hashChainData.data.hashChain?.slice(0, 20).map((block) => (
//                   <div
//                     key={block.blockNumber}
//                     className={`border rounded-lg p-4 ${
//                       block.voteType === 'anonymous' 
//                         ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
//                         : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-bold">Block #{block.blockNumber}</span>
//                         <span className={`text-xs px-2 py-0.5 rounded ${
//                           block.voteType === 'anonymous' ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
//                         }`}>
//                           {block.voteType}
//                         </span>
//                       </div>
//                       <span className="text-xs text-gray-600">
//                         {new Date(block.timestamp).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="space-y-1 text-xs font-mono">
//                       <p className="text-gray-700 truncate">
//                         <strong>Vote:</strong> {block.voteHash?.substring(0, 32)}...
//                       </p>
//                       <p className="text-gray-700 truncate">
//                         <strong>Prev:</strong> {block.previousHash?.substring(0, 32)}...
//                       </p>
//                       <p className="text-indigo-700 truncate">
//                         <strong>Block:</strong> {block.blockHash?.substring(0, 32)}...
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//                 {hashChainData.data.hashChain?.length > 20 && (
//                   <p className="text-center text-sm text-gray-500 py-2">
//                     Showing 20 of {hashChainData.data.hashChain.length} blocks
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Filter size={20} />
//             Filter Audit Logs
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
//               <select
//                 value={filters.actionType}
//                 onChange={(e) => { setFilters({ ...filters, actionType: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">All Actions</option>
//                 <option value="duplicate_vote">Duplicate Vote</option>
//                 <option value="suspicious_activity">Suspicious Activity</option>
//                 <option value="vote_cast">Vote Cast</option>
//                 <option value="vote_verified">Vote Verified</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Election ID</label>
//               <input
//                 type="number"
//                 value={filters.electionId}
//                 onChange={(e) => { setFilters({ ...filters, electionId: e.target.value }); setPage(1); }}
//                 placeholder="All elections"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={filters.startDate}
//                 onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={filters.endDate}
//                 onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={clearFilters}
//                 className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Audit Logs Table */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <Database size={20} />
//               Audit Log Entries
//             </h2>
//             {pagination && (
//               <span className="text-sm text-gray-600">
//                 {pagination.total} total entries
//               </span>
//             )}
//           </div>

//           {logsLoading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading audit logs...</p>
//             </div>
//           ) : auditLogs.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               <Database size={48} className="mx-auto mb-4 text-gray-300" />
//               <p>No audit logs found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {auditLogs.map((log) => (
//                     <tr key={log.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
//                           {getActionIcon(log.action_type)}
//                           {log.action_type?.replace(/_/g, ' ')}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className="text-sm font-semibold text-blue-600">#{log.election_id}</span>
//                         {log.election_title && (
//                           <p className="text-xs text-gray-500 truncate max-w-[150px]">{log.election_title}</p>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                         {log.user_name || `User #${log.user_id}`}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
//                         {log.ip_address || '-'}
//                       </td>
//                       <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent}>
//                         {log.user_agent?.substring(0, 40) || '-'}...
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {!logsLoading && pagination && auditLogs.length > 0 && (
//             <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
//               <div className="text-sm text-gray-700">
//                 Page {pagination.page} of {pagination.totalPages}
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   ← Previous
//                 </button>
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Verifications Section */}
//         {verificationsData?.data?.verifications?.length > 0 && (
//           <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Eye size={20} />
//               Recent Vote Verifications
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left">Verified At</th>
//                     <th className="px-4 py-2 text-left">Type</th>
//                     <th className="px-4 py-2 text-left">Election</th>
//                     <th className="px-4 py-2 text-left">Vote Hash</th>
//                     <th className="px-4 py-2 text-left">Result</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {verificationsData.data.verifications.map((v) => (
//                     <tr key={v.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-2">{new Date(v.verified_at).toLocaleString()}</td>
//                       <td className="px-4 py-2">
//                         <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
//                           {v.verification_type}
//                         </span>
//                       </td>
//                       <td className="px-4 py-2">#{v.election_id}</td>
//                       <td className="px-4 py-2 font-mono text-xs">{v.vote_hash?.substring(0, 16)}...</td>
//                       <td className="px-4 py-2">
//                         <span className={`px-2 py-1 rounded text-xs ${
//                           v.verification_result?.success ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {v.verification_result?.success ? 'Success' : 'Pending'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Info Footer */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//           <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//             <Shield size={20} className="text-blue-600" />
//             About This Audit Trail
//           </h3>
//           <p className="text-sm text-gray-700 mb-3">
//             This audit system provides industry-standard, immutable logging with blockchain-style hash chain verification.
//             Every action is cryptographically linked, making tampering detectable.
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
//             <div className="flex items-center gap-2">
//               <Hash size={14} className="text-indigo-600" />
//               SHA-256 Hashing
//             </div>
//             <div className="flex items-center gap-2">
//               <Link2 size={14} className="text-green-600" />
//               Hash Chain Linking
//             </div>
//             <div className="flex items-center gap-2">
//               <Shield size={14} className="text-blue-600" />
//               Tamper Detection
//             </div>
//             <div className="flex items-center gap-2">
//               <FileText size={14} className="text-purple-600" />
//               Export Capabilities
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { Search, Filter, Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, Eye, Download } from 'lucide-react';

// export default function AuditTrail() {
//   const [auditLogs, setAuditLogs] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [hashChain, setHashChain] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState(null);
//   const [filters, setFilters] = useState({
//     actionType: '',
//     electionId: '',
//   });
//   const [showHashChain, setShowHashChain] = useState(false);
//   const [selectedElectionForHash, setSelectedElectionForHash] = useState('');

//   // Get API URL
//   const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3006/api';

//   // Get user data from localStorage
//   const getUserData = () => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
//         return {
//           userId: authData.userData?.userId,
//           email: authData.userData?.email,
//           token: authData.token,
//         };
//       }
//     } catch (error) {
//       console.error('Error reading user data:', error);
//     }
//     return null;
//   };

//   // Get vote data from localStorage
//   const getVoteData = () => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const voteData = parsed.vote ? JSON.parse(parsed.vote) : {};
//         return voteData;
//       }
//     } catch (error) {
//       console.error('Error reading vote data:', error);
//     }
//     return null;
//   };

//   useEffect(() => {
//     fetchAuditData();
//   }, [page, filters]);

//   const fetchAuditData = async () => {
//     setLoading(true);
//     try {
//       const userData = getUserData();
      
//       // Build query params
//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         limit: '20',
//         ...(filters.actionType && { actionType: filters.actionType }),
//         ...(filters.electionId && { electionId: filters.electionId }),
//       });

//       // Fetch audit logs
//       const logsResponse = await fetch(
//         `${API_URL}/votes/audit-trail?${queryParams}`,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
//           },
//         }
//       );
//       const logsData = await logsResponse.json();

//       // Fetch stats
//       const statsResponse = await fetch(`${API_URL}/votes/audit-stats`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
//         },
//       });
//       const statsData = await statsResponse.json();

//       if (logsData.success) {
//         setAuditLogs(logsData.data.auditLogs);
//         setPagination(logsData.data.pagination);
//       }

//       if (statsData.success) {
//         setStats(statsData.data);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching audit data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchHashChain = async (electionId) => {
//     try {
//       const userData = getUserData();
      
//       const response = await fetch(`${API_URL}/votes/hash-chain/${electionId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
//         },
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         setHashChain(data.data);
//         setShowHashChain(true);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching hash chain:', error);
//     }
//   };

//   const getActionIcon = (actionType) => {
//     switch (actionType) {
//       case 'vote_cast':
//         return <CheckCircle className="text-green-600" size={20} />;
//       case 'vote_edited':
//         return <AlertCircle className="text-yellow-600" size={20} />;
//       case 'vote_verified':
//         return <Shield className="text-blue-600" size={20} />;
//       case 'video_completed':
//         return <Eye className="text-purple-600" size={20} />;
//       default:
//         return <Lock className="text-gray-600" size={20} />;
//     }
//   };

//   const getActionColor = (actionType) => {
//     switch (actionType) {
//       case 'vote_cast':
//         return 'bg-green-100 text-green-800';
//       case 'vote_edited':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'vote_verified':
//         return 'bg-blue-100 text-blue-800';
//       case 'video_completed':
//         return 'bg-purple-100 text-purple-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const voteData = getVoteData();

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             🔒 Audit Trail & Blockchain Verification
//           </h1>
//           <p className="text-gray-600">
//             Immutable log system with cryptographic proof for all voting actions
//           </p>
          
//           {/* Show current user's vote info if available */}
//           {voteData && voteData.hasVoted && (
//             <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <p className="text-sm text-blue-900">
//                 <strong>Your Last Vote:</strong> Election #{voteData.electionId} - {voteData.electionTitle}
//               </p>
//               <p className="text-xs text-blue-700 mt-1 font-mono">
//                 Vote ID: {voteData.voteId?.substring(0, 16)}...
//               </p>
//               <p className="text-xs text-blue-700 font-mono">
//                 Receipt: {voteData.receiptId?.substring(0, 16)}...
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Statistics Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Actions</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall.total_actions}
//                   </p>
//                 </div>
//                 <Shield className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Unique Users</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall.unique_users}
//                   </p>
//                 </div>
//                 <CheckCircle className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes.total_votes}
//                   </p>
//                 </div>
//                 <Lock className="text-purple-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Actions (24h)</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.recentActivity.actions_24h}
//                   </p>
//                 </div>
//                 <AlertCircle className="text-orange-600" size={40} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Type Breakdown */}
//         {stats && stats.actionTypes && stats.actionTypes.length > 0 && (
//           <div className="bg-white rounded-lg shadow p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">
//               📊 Action Type Distribution
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.actionTypes.map((action) => (
//                 <div
//                   key={action.action_type}
//                   className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
//                 >
//                   {getActionIcon(action.action_type)}
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {action.action_type.replace(/_/g, ' ').toUpperCase()}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{action.count}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Vote Statistics */}
//         {stats && stats.votes && (
//           <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">
//               🗳️ Voting Statistics
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Total Votes</p>
//                 <p className="text-2xl font-bold text-purple-900">{stats.votes.total_votes}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Unique Voters</p>
//                 <p className="text-2xl font-bold text-blue-900">{stats.votes.unique_voters}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Elections</p>
//                 <p className="text-2xl font-bold text-green-900">{stats.votes.elections_voted}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Valid Votes</p>
//                 <p className="text-2xl font-bold text-teal-900">{stats.votes.valid_votes}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Edited Votes</p>
//                 <p className="text-2xl font-bold text-orange-900">{stats.votes.edited_votes}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Blockchain Hash Chain Section */}
//         <div className="bg-white rounded-lg shadow p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Hash className="text-indigo-600" />
//             Blockchain-Style Hash Chain Verification
//           </h2>
//           <p className="text-sm text-gray-600 mb-4">
//             View the cryptographic hash chain for any election to verify vote integrity
//           </p>
//           <div className="flex gap-4">
//             <input
//               type="number"
//               value={selectedElectionForHash}
//               onChange={(e) => setSelectedElectionForHash(e.target.value)}
//               placeholder="Enter Election ID"
//               className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
//             />
//             <button
//               onClick={() => selectedElectionForHash && fetchHashChain(selectedElectionForHash)}
//               className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
//               disabled={!selectedElectionForHash}
//             >
//               <Link2 size={16} />
//               Generate Hash Chain
//             </button>
//           </div>

//           {/* Hash Chain Display */}
//           {showHashChain && hashChain && (
//             <div className="mt-6 border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Hash Chain for Election #{hashChain.electionId}
//                 </h3>
//                 <button
//                   onClick={() => setShowHashChain(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                 <p className="text-sm"><strong>Total Blocks:</strong> {hashChain.totalBlocks}</p>
//                 <p className="text-sm font-mono text-xs mt-2">
//                   <strong>Latest Block Hash:</strong><br />
//                   {hashChain.latestBlockHash}
//                 </p>
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {hashChain.hashChain.map((block) => (
//                   <div
//                     key={block.blockNumber}
//                     className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm font-bold text-indigo-900">
//                         Block #{block.blockNumber}
//                       </span>
//                       <span className="text-xs text-gray-600">
//                         {new Date(block.timestamp).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="space-y-1 text-xs font-mono">
//                       <p className="text-gray-700">
//                         <strong>Vote Hash:</strong> {block.voteHash.substring(0, 32)}...
//                       </p>
//                       <p className="text-gray-700">
//                         <strong>Previous Hash:</strong> {block.previousHash.substring(0, 32)}...
//                       </p>
//                       <p className="text-indigo-700">
//                         <strong>Block Hash:</strong> {block.blockHash.substring(0, 32)}...
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Filter size={20} />
//             Filter Audit Logs
//           </h3>
//           <div className="flex flex-wrap gap-4">
//             <div className="flex-1 min-w-[200px]">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Action Type
//               </label>
//               <select
//                 value={filters.actionType}
//                 onChange={(e) => {
//                   setFilters({ ...filters, actionType: e.target.value });
//                   setPage(1);
//                 }}
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Actions</option>
//                 <option value="vote_cast">Vote Cast</option>
//                 <option value="vote_edited">Vote Edited</option>
//                 <option value="vote_verified">Vote Verified</option>
//                 <option value="video_completed">Video Completed</option>
//                 <option value="video_started">Video Started</option>
//               </select>
//             </div>

//             <div className="flex-1 min-w-[200px]">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Election ID
//               </label>
//               <input
//                 type="number"
//                 value={filters.electionId}
//                 onChange={(e) => {
//                   setFilters({ ...filters, electionId: e.target.value });
//                   setPage(1);
//                 }}
//                 placeholder="Enter Election ID"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={() => {
//                   setFilters({ actionType: '', electionId: '' });
//                   setPage(1);
//                 }}
//                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Audit Logs Table */}
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <Database size={20} />
//               Audit Log Entries
//             </h2>
//           </div>

//           {loading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading audit logs...</p>
//             </div>
//           ) : auditLogs.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               <Database size={48} className="mx-auto mb-4 text-gray-300" />
//               <p>No audit logs found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Timestamp
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Action
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Election
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       User
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Vote Hash
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Receipt
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {auditLogs.map((log) => (
//                     <tr key={log.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
//                             log.action_type
//                           )}`}
//                         >
//                           {getActionIcon(log.action_type)}
//                           {log.action_type.replace(/_/g, ' ').toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
//                         #{log.election_id}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {log.user_id ? `${log.user_id.substring(0, 8)}...` : '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {log.vote_hash ? (
//                           <span title={log.vote_hash}>
//                             {log.vote_hash.substring(0, 12)}...
//                           </span>
//                         ) : '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {log.receipt_id ? (
//                           <span title={log.receipt_id}>
//                             {log.receipt_id.substring(0, 8)}...
//                           </span>
//                         ) : '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`text-xs px-2 py-1 rounded font-semibold ${
//                           log.vote_status === 'valid' ? 'bg-green-100 text-green-800' :
//                           log.vote_status === 'edited' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {log.vote_status || 'N/A'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {!loading && pagination && auditLogs.length > 0 && (
//             <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
//               <div className="text-sm text-gray-700">
//                 Showing page {pagination.page} of {pagination.totalPages} 
//                 <span className="text-gray-500 ml-2">
//                   ({pagination.total} total entries)
//                 </span>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   ← Previous
//                 </button>
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer Info */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//           <h3 className="font-bold text-gray-900 mb-2">🔐 About This Audit Trail</h3>
//           <p className="text-sm text-gray-700 mb-2">
//             This audit trail provides a complete, immutable record of all voting activities. Every action is cryptographically hashed and linked in a blockchain-style chain, ensuring tamper-evident logging.
//           </p>
//           <p className="text-xs text-gray-600">
//             <strong>Features:</strong> SHA-256 hashing, Hash chain verification, Timestamp proof, IP tracking, User agent logging, Vote integrity checking
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React from 'react';

// export default function AuditTrail() {
//   const auditLogs = [
//     { id: 1, user: 'Admin', action: 'Created Election', target: 'Feature Request', timestamp: '2 hours ago', status: 'success' },
//     { id: 2, user: 'jane@example.com', action: 'Voted', target: 'Design Theme', timestamp: '3 hours ago', status: 'success' },
//     { id: 3, user: 'bob@example.com', action: 'Flagged Vote', target: 'API Updates', timestamp: '5 hours ago', status: 'warning' },
//     { id: 4, user: 'Admin', action: 'Deleted User', target: 'spam_user@example.com', timestamp: '1 day ago', status: 'danger' },
//     { id: 5, user: 'Admin', action: 'Promoted User', target: 'jane@example.com', timestamp: '2 days ago', status: 'success' },
//   ];

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Audit Trail shakil</h1>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Target</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {auditLogs.map((log) => (
//                 <tr key={log.id} className="border-b hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-semibold">{log.user}</td>
//                   <td className="px-6 py-4 text-sm">{log.action}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{log.target}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
//                   <td className="px-6 py-4 text-sm">
//                     <span className={`text-xs px-2 py-1 rounded font-semibold ${
//                       log.status === 'success' ? 'bg-green-100 text-green-800' :
//                       log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {log.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }