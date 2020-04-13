pragma solidity ^0.5.0;


contract test {
    function testTransfer(uint256 _amount) public payable {
        msg.sender.transfer(_amount);
    }

    function verify(bytes32 _message, uint8 _v, bytes32 _r, bytes32 _s)
        public
        pure
        returns (address)
    {
        address signer = ecrecover(_message, _v, _r, _s);
        return signer;
    }
}
