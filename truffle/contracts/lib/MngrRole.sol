pragma solidity ^0.5.0;

import "./Context.sol";
import "./Roles.sol";

/**
 * @title MngrRole
 * @dev Mngrs are responsible for assigning and removing Whitelisted accounts.
 */
contract MngrRole is Context {
    using Roles for Roles.Role;

    event MngrAdded(address indexed account);
    event MngrRemoved(address indexed account);

    Roles.Role private _mngrs;

    constructor () internal {
        _addMngr(_msgSender());
    }

    modifier onlyMngr() {
        require(isMngr(_msgSender()), "MngrRole: caller does not have the Mngr role");
        _;
    }

    function isMngr(address account) public view returns (bool) {
        return _mngrs.has(account);
    }

    function addMngr(address account) public onlyMngr {
        _addMngr(account);
    }

    function renounceMngr() public {
        _removeMngr(_msgSender());
    }

    function _addMngr(address account) internal {
        _mngrs.add(account);
        emit MngrAdded(account);
    }

    function _removeMngr(address account) internal {
        _mngrs.remove(account);
        emit MngrRemoved(account);
    }
}