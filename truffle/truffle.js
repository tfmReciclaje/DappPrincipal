module.exports = {

    contracts_build_directory: "./build",

    networks: {

      ganache: {
        host: "localhost",
        port: 7545,
        network_id: "5777", 
        from: "0xb253e4fCe8122904072a7EcB464030A0C141D064",  
        gas: 7000000, // Gas limit used for deploys             
      },

      develop: {
        port: 7545,
        gas: 7000000, // Gas limit used for deploys
        gasPrice: 20000000000  // 20 gwei (in wei) (default: 100 gwei)
      },

      rinkeby: {
        host: "localhost", // Connect to geth on the specified
        port: 8545,
        //from: "0xcf757ac9610b264aa967832c93a0e9ccc5f99d8e",
        network_id: 4,
        gas: 4612388, // Gas limit used for deploys      
      }
    },

    /*
        solc: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
    */

    // Configure your compilers
    compilers: {
      solc: {
        version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
        // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
        settings: {          // See the solidity docs for advice about optimization and evmVersion
          optimizer: {
            enabled: true,
            runs: 200
          },
        // evmVersion: "byzantium"
        }
      }
    }
};
