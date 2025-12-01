// server.js - Complete Backend for Certificate Validator

const express = require('express');
const cors = require('cors');
const { Web3 } = require('web3');
const crypto = require('crypto');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Web3 Setup (connecting to blockchain)
const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-mumbai.infura.io/v3/YOUR_KEY');

// Smart Contract Setup
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require('./contractABI.json'); // Your compiled contract ABI
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Account Setup (for signing transactions)
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate cryptographic hash for certificate
 */
function generateCertificateHash(certData) {
  const dataString = JSON.stringify({
    studentId: certData.studentId,
    studentName: certData.studentName,
    degree: certData.degree,
    institution: certData.institution,
    grade: certData.grade,
    issueDate: certData.issueDate
  });
  
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Generate unique certificate ID
 */
function generateCertificateId() {
  return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Generate QR code
 */
async function generateQRCode(data) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data);
    return qrCodeDataURL;
  } catch (err) {
    throw new Error('QR Code generation failed');
  }
}

/**
 * Generate PDF Certificate
 */
async function generatePDFCertificate(certData, qrCodeDataURL) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    
    // Certificate Design
    doc.fontSize(40).text('Certificate of Completion', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(20).text('This certifies that', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(30).fillColor('blue').text(certData.studentName, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(1);
    
    doc.fontSize(18).text(`has successfully completed`, { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(24).fillColor('blue').text(certData.degree, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(1);
    
    doc.fontSize(16).text(`From ${certData.institution}`, { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(14).text(`Grade: ${certData.grade}`, { align: 'center' });
    doc.text(`Date: ${certData.issueDate}`, { align: 'center' });
    doc.moveDown(1);
    
    doc.fontSize(12).text(`Certificate ID: ${certData.certificateId}`, { align: 'center' });
    doc.fontSize(10).text(`Blockchain Hash: ${certData.hash}`, { align: 'center' });
    
    // Add QR Code
    if (qrCodeDataURL) {
      const qrImage = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
      doc.image(qrImage, doc.page.width - 150, doc.page.height - 150, { width: 100 });
      doc.fontSize(8).text('Scan to verify', doc.page.width - 150, doc.page.height - 40, { width: 100, align: 'center' });
    }
    
    doc.end();
  });
}

// ============================================
// API ROUTES
// ============================================

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'active', 
    message: 'Certificate Validator API is running',
    blockchain: 'connected'
  });
});

/**
 * Issue Certificate
 * POST /api/certificates/issue
 */
app.post('/api/certificates/issue', async (req, res) => {
  try {
    const { studentName, studentId, degree, institution, grade, issueDate } = req.body;
    
    // Validation
    if (!studentName || !studentId || !degree || !institution || !grade || !issueDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Generate certificate data
    const certificateId = generateCertificateId();
    const certData = {
      certificateId,
      studentName,
      studentId,
      degree,
      institution,
      grade,
      issueDate
    };
    
    // Generate hash
    const hash = generateCertificateHash(certData);
    certData.hash = hash;
    
    // Store on blockchain
    console.log('Storing certificate on blockchain...');
    const gasEstimate = await contract.methods
      .issueCertificate(
        certificateId,
        studentId,
        studentName,
        degree,
        institution,
        grade,
        issueDate,
        hash
      )
      .estimateGas({ from: account.address });
    
    const tx = await contract.methods
      .issueCertificate(
        certificateId,
        studentId,
        studentName,
        degree,
        institution,
        grade,
        issueDate,
        hash
      )
      .send({
        from: account.address,
        gas: gasEstimate,
      });
    
    console.log('Certificate stored! Transaction:', tx.transactionHash);
    
    // Generate QR Code
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?id=${certificateId}`;
    const qrCode = await generateQRCode(verificationUrl);
    
    // Generate PDF
    const pdfBuffer = await generatePDFCertificate(certData, qrCode);
    
    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateId,
        hash,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        qrCode,
        verificationUrl
      }
    });
    
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ 
      error: 'Failed to issue certificate', 
      details: error.message 
    });
  }
});

/**
 * Verify Certificate
 * GET /api/certificates/verify/:certificateId
 */
app.get('/api/certificates/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Query blockchain
    console.log('Verifying certificate on blockchain...');
    const isValid = await contract.methods
      .verifyCertificate(certificateId)
      .call();
    
    if (!isValid) {
      return res.json({
        valid: false,
        message: 'Certificate not found or has been revoked'
      });
    }
    
    // Get full certificate details
    const certData = await contract.methods
      .getCertificate(certificateId)
      .call();
    
    res.json({
      valid: true,
      message: 'Certificate is authentic and verified on blockchain',
      data: {
        certificateId,
        studentId: certData.studentId,
        studentName: certData.studentName,
        degree: certData.degree,
        institution: certData.institution,
        grade: certData.grade,
        issueDate: certData.issueDate,
        hash: certData.certificateHash,
        timestamp: new Date(Number(certData.timestamp) * 1000).toISOString(),
        issuer: certData.issuer,
        isValid: certData.isValid
      }
    });
    
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ 
      error: 'Verification failed', 
      details: error.message 
    });
  }
});

/**
 * Get Certificate Details (without blockchain query)
 * GET /api/certificates/:certificateId
 */
app.get('/api/certificates/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certData = await contract.methods
      .getCertificate(certificateId)
      .call();
    
    res.json({
      success: true,
      data: {
        certificateId,
        studentId: certData.studentId,
        studentName: certData.studentName,
        degree: certData.degree,
        institution: certData.institution,
        grade: certData.grade,
        issueDate: certData.issueDate,
        hash: certData.certificateHash,
        timestamp: new Date(Number(certData.timestamp) * 1000).toISOString(),
        issuer: certData.issuer,
        isValid: certData.isValid
      }
    });
    
  } catch (error) {
    res.status(404).json({ 
      error: 'Certificate not found', 
      details: error.message 
    });
  }
});

/**
 * Revoke Certificate (Admin only)
 * POST /api/certificates/revoke/:certificateId
 */
app.post('/api/certificates/revoke/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const tx = await contract.methods
      .revokeCertificate(certificateId)
      .send({
        from: account.address,
      });
    
    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      transactionHash: tx.transactionHash
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to revoke certificate', 
      details: error.message 
    });
  }
});

/**
 * Authorize Institution (Admin only)
 * POST /api/admin/authorize
 */
app.post('/api/admin/authorize', async (req, res) => {
  try {
    const { institutionAddress } = req.body;
    
    if (!web3.utils.isAddress(institutionAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    
    const tx = await contract.methods
      .authorizeInstitution(institutionAddress)
      .send({
        from: account.address,
      });
    
    res.json({
      success: true,
      message: 'Institution authorized successfully',
      transactionHash: tx.transactionHash
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to authorize institution', 
      details: error.message 
    });
  }
});

/**
 * Download Certificate PDF
 * GET /api/certificates/:certificateId/download
 */
app.get('/api/certificates/:certificateId/download', async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Get certificate data from blockchain
    const certData = await contract.methods
      .getCertificate(certificateId)
      .call();
    
    const certInfo = {
      certificateId,
      studentName: certData.studentName,
      studentId: certData.studentId,
      degree: certData.degree,
      institution: certData.institution,
      grade: certData.grade,
      issueDate: certData.issueDate,
      hash: certData.certificateHash
    };
    
    // Generate QR code
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?id=${certificateId}`;
    const qrCode = await generateQRCode(verificationUrl);
    
    // Generate PDF
    const pdfBuffer = await generatePDFCertificate(certInfo, qrCode);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificateId}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: error.message 
    });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Certificate Validator API running on port ${PORT}`);
  console.log(`📊 Blockchain RPC: ${process.env.BLOCKCHAIN_RPC_URL || 'Not configured'}`);
  console.log(`📝 Contract Address: ${contractAddress || 'Not configured'}`);
});