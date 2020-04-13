pragma solidity ^0.5.0;


    function createDocument(uint256 _verifier, string memory documentoTitle)
        public
    {   
        require(!myDocuments[_verifier], "Document already exists!");

        myDocuments[_verifier].issuer = msg.sender;
        myDocuments[_verifier].documentoTitle;
        myDocuments[_verifier].State = Created;
        myDocuments[_verifier].timeStamp = now;
    }
    