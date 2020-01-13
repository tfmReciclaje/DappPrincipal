pragma solidity ^0.5.0;

import "./Context.sol";
import "./Roles.sol";

/**
 * @title TracerRole
 * @dev Tracer are responsible for assigning and removing Whitelisted accounts.
 */
contract TracerRole is Context {
    using Roles for Roles.Role;

    event TracerAdded(address indexed account);
    event TracerRemoved(address indexed account);

    Roles.Role private _Tracer;

    constructor () internal {
        _addTracer(_msgSender());
    }

    modifier onlyTracer() {
        require(isTracer(_msgSender()), "TracerRole: caller does not have the Tracer role");
        _;
    }

    function isTracer(address account) public view returns (bool) {
        return _Tracer.has(account);
    }

    function addTracer(address account) public onlyTracer {
        _addTracer(account);
    }

    function renounceTracer() public {
        _removeTracer(_msgSender());
    }

    function _addTracer(address account) internal {
        _Tracer.add(account);
        emit TracerAdded(account);
    }

    function _removeTracer(address account) internal {
        _Tracer.remove(account);
        emit TracerRemoved(account);
    }
}