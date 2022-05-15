var LandRegistry = artifacts.require("../contracts/LandRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(LandRegistry);
};
