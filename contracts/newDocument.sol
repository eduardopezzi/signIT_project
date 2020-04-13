pragma solidity ^0.5.0;

import {ECDSA} from "@OpenZeppelin/contracts/cryptography/ECDSA.sol";


contract NewDocument {
    /////////////////
    // Contract State
    ////////////////

    address public factoryAddress;
    uint256 public documentTimeStamp;
    uint256 public numberOfSigners;
    uint256 public revokeCounter;
    address public issuer;
    bytes32 public verifier;
    address[] public signersArray;

    enum Status {Pending, Signed, Revoked}
    Status public status;

    struct Signatures {
        uint256 signatureTimeStamp;
        bytes signatureTX;
        bool isValid;
        uint256 revokedSig;
    }

    mapping(address => Signatures) public signers;

    ///////////////
    // CONSTRUCTOR
    //////////////

    constructor(bytes32 _Verifier, uint256 _numberOfSigners) public {
        issuer = msg.sender;
        documentTimeStamp = block.timestamp;
        verifier = _Verifier;
        numberOfSigners = _numberOfSigners;
        status = Status.Pending;
    }

    // Document Hash identifier as the key to retrive its information

    event Signed(address indexed _signer);
    event Revoked(address indexed _signer);
    event DocRevoked(bytes32 indexed _verifier);

    function signersList() public view returns (address[] memory) {
        return signersArray;
    }

    function signContract(
        bytes32 _message,
        uint8 _v,
        bytes32 _r,
        bytes32 _s,
        bytes memory _signature
    ) public returns (bool success) {
        address validSignature;
        validSignature = verify(_message, _v, _r, _s);
        require(
            signers[validSignature].isValid == false &&
                status == Status.Pending,
            "This Document is already signed"
        );
        signers[msg.sender].signatureTimeStamp = now;
        signers[msg.sender].signatureTX = _signature;
        signers[msg.sender].isValid = true;
        signersArray.push(msg.sender);
        if (signersArray.length == numberOfSigners) {
            status = Status.Signed;
        }
        emit Signed(validSignature);
        return true;
    }

    function verify(bytes32 _message, uint8 _v, bytes32 _r, bytes32 _s)
        public
        pure
        returns (address)
    {
        address signer = ecrecover(_message, _v, _r, _s);

        return signer;
    }

    function setNumeberOfSigners(uint8 _number) public {
        require(msg.sender == issuer, "only issuer can change");
        numberOfSigners = _number;
    }

    function revokeSignature(bytes32 _message, uint8 _v, bytes32 _r, bytes32 _s)
        public
    {
        address validSignature;
        validSignature = verify(_message, _v, _r, _s);
        require(
            signers[validSignature].isValid == true,
            "Signature is NOT valid"
        );
        address signer = msg.sender;
        _revoke(signer);
        emit Revoked(msg.sender);
        if (revokeCounter == numberOfSigners) {
            status = Status.Revoked;
            emit DocRevoked(verifier);
        }
    }

    function _revoke(address _signer) internal {
        signers[_signer].revokedSig = now;
        signers[_signer].isValid = false;
        revokeCounter++;
    }
}
