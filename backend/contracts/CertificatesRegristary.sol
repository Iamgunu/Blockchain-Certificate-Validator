// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertificateRegistry
 * @dev Smart Contract for storing and verifying educational certificates on blockchain
 */
contract CertificateRegistry {
    
    // Certificate structure
    struct Certificate {
        string studentId;
        string studentName;
        string degree;
        string institution;
        string grade;
        string issueDate;
        string certificateHash;
        uint256 timestamp;
        address issuer;
        bool isValid;
    }
    
    // Mapping from certificate ID to Certificate
    mapping(string => Certificate) public certificates;
    
    // Mapping to track authorized institutions
    mapping(address => bool) public authorizedInstitutions;
    
    // Contract owner
    address public owner;
    
    // Events
    event CertificateIssued(
        string indexed certificateId,
        string studentId,
        string studentName,
        string institution,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        string indexed certificateId,
        uint256 timestamp
    );
    
    event InstitutionAuthorized(
        address indexed institutionAddress,
        uint256 timestamp
    );
    
    event InstitutionRevoked(
        address indexed institutionAddress,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedInstitutions[msg.sender] || msg.sender == owner,
            "Not authorized to issue certificates"
        );
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        authorizedInstitutions[msg.sender] = true;
    }
    
    /**
     * @dev Issue a new certificate
     * @param _certificateId Unique certificate identifier
     * @param _studentId Student's unique ID
     * @param _studentName Student's full name
     * @param _degree Degree or course name
     * @param _institution Institution name
     * @param _grade Grade obtained
     * @param _issueDate Date of issuance
     * @param _certificateHash Cryptographic hash of the certificate
     */
    function issueCertificate(
        string memory _certificateId,
        string memory _studentId,
        string memory _studentName,
        string memory _degree,
        string memory _institution,
        string memory _grade,
        string memory _issueDate,
        string memory _certificateHash
    ) public onlyAuthorized {
        require(
            bytes(certificates[_certificateId].certificateHash).length == 0,
            "Certificate ID already exists"
        );
        
        certificates[_certificateId] = Certificate({
            studentId: _studentId,
            studentName: _studentName,
            degree: _degree,
            institution: _institution,
            grade: _grade,
            issueDate: _issueDate,
            certificateHash: _certificateHash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isValid: true
        });
        
        emit CertificateIssued(
            _certificateId,
            _studentId,
            _studentName,
            _institution,
            block.timestamp
        );
    }
    
    /**
     * @dev Verify if a certificate is valid
     * @param _certificateId Certificate ID to verify
     * @return bool Returns true if certificate exists and is valid
     */
    function verifyCertificate(string memory _certificateId)
        public
        view
        returns (bool)
    {
        return certificates[_certificateId].isValid &&
               bytes(certificates[_certificateId].certificateHash).length > 0;
    }
    
    /**
     * @dev Get complete certificate details
     * @param _certificateId Certificate ID
     * @return Certificate struct with all details
     */
    function getCertificate(string memory _certificateId)
        public
        view
        returns (Certificate memory)
    {
        require(
            bytes(certificates[_certificateId].certificateHash).length > 0,
            "Certificate does not exist"
        );
        return certificates[_certificateId];
    }
    
    /**
     * @dev Revoke a certificate
     * @param _certificateId Certificate ID to revoke
     */
    function revokeCertificate(string memory _certificateId)
        public
        onlyAuthorized
    {
        require(
            bytes(certificates[_certificateId].certificateHash).length > 0,
            "Certificate does not exist"
        );
        
        certificates[_certificateId].isValid = false;
        
        emit CertificateRevoked(_certificateId, block.timestamp);
    }
    
    /**
     * @dev Authorize an institution to issue certificates
     * @param _institution Address of the institution
     */
    function authorizeInstitution(address _institution) public onlyOwner {
        authorizedInstitutions[_institution] = true;
        emit InstitutionAuthorized(_institution, block.timestamp);
    }
    
    /**
     * @dev Revoke an institution's authorization
     * @param _institution Address of the institution
     */
    function revokeInstitutionAuthorization(address _institution)
        public
        onlyOwner
    {
        authorizedInstitutions[_institution] = false;
        emit InstitutionRevoked(_institution, block.timestamp);
    }
    
    /**
     * @dev Check if an address is an authorized institution
     * @param _institution Address to check
     * @return bool Returns true if authorized
     */
    function isAuthorizedInstitution(address _institution)
        public
        view
        returns (bool)
    {
        return authorizedInstitutions[_institution];
    }
    
    /**
     * @dev Verify certificate hash matches stored hash
     * @param _certificateId Certificate ID
     * @param _hash Hash to verify
     * @return bool Returns true if hashes match
     */
    function verifyHash(string memory _certificateId, string memory _hash)
        public
        view
        returns (bool)
    {
        return keccak256(abi.encodePacked(certificates[_certificateId].certificateHash)) ==
               keccak256(abi.encodePacked(_hash));
    }
}