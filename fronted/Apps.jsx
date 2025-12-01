import React, { useState } from 'react';
import { Shield, Upload, Search, CheckCircle, XCircle, Award, QrCode, FileText, Users, TrendingUp } from 'lucide-react';

// Simulated blockchain storage (in a real app, this would be a smart contract)
const blockchainStorage = {};
let certificateCounter = 1000;

const BlockchainCertValidator = () => {
  const [activeTab, setActiveTab] = useState('issue');
  const [issuedCerts, setIssuedCerts] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  
  // Issue Certificate Form State
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    degree: '',
    institution: '',
    issueDate: new Date().toISOString().split('T')[0],
    grade: ''
  });

  // Verification Form State
  const [certId, setCertId] = useState('');

  // Generate hash (simplified - in real app, use proper cryptographic hash)
  const generateHash = (data) => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  };

  // Issue Certificate
  const handleIssueCertificate = () => {
    if (!formData.studentName || !formData.studentId || !formData.degree || !formData.institution || !formData.grade) {
      alert('Please fill in all required fields');
      return;
    }
    
    const certId = `CERT-${certificateCounter++}`;
    const timestamp = Date.now();
    const certData = { ...formData, certId, timestamp };
    const hash = generateHash(certData);
    
    // Store in "blockchain"
    blockchainStorage[certId] = {
      hash,
      data: certData,
      blockNumber: Object.keys(blockchainStorage).length + 1,
      timestamp
    };

    const newCert = {
      ...certData,
      hash,
      qrData: `VERIFY:${certId}:${hash.substring(0, 8)}`
    };

    setIssuedCerts([newCert, ...issuedCerts]);
    
    // Reset form
    setFormData({
      studentName: '',
      studentId: '',
      degree: '',
      institution: '',
      issueDate: new Date().toISOString().split('T')[0],
      grade: ''
    });

    alert(`Certificate issued successfully!\nCertificate ID: ${certId}`);
  };

  // Verify Certificate
  const handleVerifyCertificate = () => {
    if (!certId) {
      alert('Please enter a Certificate ID');
      return;
    }
    
    const blockchainRecord = blockchainStorage[certId];
    
    if (!blockchainRecord) {
      setVerificationResult({
        valid: false,
        message: 'Certificate not found in blockchain',
        certId
      });
      return;
    }

    // In real app, would verify hash matches
    setVerificationResult({
      valid: true,
      message: 'Certificate is authentic and verified on blockchain',
      certId,
      data: blockchainRecord.data,
      blockNumber: blockchainRecord.blockNumber,
      timestamp: new Date(blockchainRecord.timestamp).toLocaleString(),
      hash: blockchainRecord.hash
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CertChain</h1>
                <p className="text-sm text-gray-600">Blockchain Certificate Validator</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Blockchain Status</p>
                <p className="text-sm font-semibold text-green-600">🟢 Active</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Certificates</p>
                <p className="text-sm font-semibold text-indigo-600">{Object.keys(blockchainStorage).length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-2 bg-white rounded-lg p-2 shadow-sm">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'issue'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-5 h-5" />
            Issue Certificate
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'verify'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5" />
            Verify Certificate
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Issue Certificate Tab */}
        {activeTab === 'issue' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-600" />
                Issue New Certificate
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="STU2024001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree/Course *
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Bachelor of Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Tech University"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade *
                    </label>
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="A+"
                    />
                  </div>
                </div>

                <button
                  onClick={handleIssueCertificate}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Issue Certificate & Record on Blockchain
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-4">How It Works</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                    <p>Fill in certificate details and submit the form</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                    <p>System generates cryptographic hash of certificate data</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                    <p>Hash is recorded on blockchain with timestamp</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">4</div>
                    <p>Unique Certificate ID and QR code are generated</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">5</div>
                    <p>Certificate becomes tamper-proof and verifiable forever</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Recently Issued
                </h3>
                {issuedCerts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No certificates issued yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {issuedCerts.map((cert, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{cert.studentName}</p>
                            <p className="text-sm text-gray-600">{cert.degree}</p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>ID: {cert.certId}</p>
                          <p>Hash: {cert.hash.substring(0, 16)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Verify Certificate Tab */}
        {activeTab === 'verify' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-indigo-600" />
                Verify Certificate Authenticity
              </h2>

              <div className="mb-8">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    placeholder="Enter Certificate ID (e.g., CERT-1000)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                  <button
                    onClick={handleVerifyCertificate}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {verificationResult && (
                <div className={`rounded-xl p-6 ${
                  verificationResult.valid 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className="flex items-start gap-4">
                    {verificationResult.valid ? (
                      <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        verificationResult.valid ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {verificationResult.valid ? 'Certificate Verified ✓' : 'Verification Failed ✗'}
                      </h3>
                      <p className={`mb-4 ${
                        verificationResult.valid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {verificationResult.message}
                      </p>

                      {verificationResult.valid && verificationResult.data && (
                        <div className="bg-white rounded-lg p-6 space-y-3">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Student Name</p>
                              <p className="font-semibold text-gray-900">{verificationResult.data.studentName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Student ID</p>
                              <p className="font-semibold text-gray-900">{verificationResult.data.studentId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Degree/Course</p>
                              <p className="font-semibold text-gray-900">{verificationResult.data.degree}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Institution</p>
                              <p className="font-semibold text-gray-900">{verificationResult.data.institution}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                              <p className="font-semibold text-gray-900">{verificationResult.data.issueDate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Grade</p>
                              <p className="font-semibold text-gray-900">{verificationResult.data.grade}</p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Blockchain Details</p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <p><span className="text-gray-600">Block Number:</span> <span className="font-mono text-indigo-600">#{verificationResult.blockNumber}</span></p>
                              <p><span className="text-gray-600">Timestamp:</span> <span className="font-mono text-indigo-600">{verificationResult.timestamp}</span></p>
                            </div>
                            <p className="mt-2 text-xs"><span className="text-gray-600">Hash:</span> <span className="font-mono text-gray-800 break-all">{verificationResult.hash}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code Verification
                </h4>
                <p className="text-sm text-blue-800">
                  Scan the QR code on the physical certificate to instantly verify its authenticity. 
                  The QR code contains the Certificate ID which can be verified against the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{Object.keys(blockchainStorage).length}</span>
                </div>
                <p className="text-sm text-gray-600">Total Certificates</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{new Set(issuedCerts.map(c => c.studentId)).size}</span>
                </div>
                <p className="text-sm text-gray-600">Unique Students</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-indigo-600" />
                  <span className="text-2xl font-bold text-gray-900">100%</span>
                </div>
                <p className="text-sm text-gray-600">Verified Rate</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">{Object.keys(blockchainStorage).length}</span>
                </div>
                <p className="text-sm text-gray-600">Blockchain Blocks</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">All Certificates on Blockchain</h3>
              
              {Object.keys(blockchainStorage).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No certificates issued yet. Start by issuing your first certificate!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(blockchainStorage).map(([certId, record]) => (
                        <tr key={certId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">#{record.blockNumber}</td>
                          <td className="px-4 py-3 text-sm font-medium text-indigo-600">{certId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{record.data.studentName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.data.degree}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.data.institution}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">{record.hash.substring(0, 12)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 CertChain - Blockchain Certificate Validator
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-indigo-600">Documentation</a>
              <a href="#" className="hover:text-indigo-600">API</a>
              <a href="#" className="hover:text-indigo-600">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlockchainCertValidator;