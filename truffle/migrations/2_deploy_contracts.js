var Main = artifacts.require("Main.sol");
var CustomOracle = artifacts.require("CustomOracle.sol");

module.exports = function(deployer) { 

  deployer.deploy(CustomOracle, {gas: 6500000, value: 1000000000000000000}).then(function(){
    return deployer.deploy(Main, CustomOracle.address, {gas: 6500000, value: 1000000000000000000}); 
  })  
};
