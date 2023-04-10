import './App.css';
import { useState } from 'react';
import Web3 from 'web3';
import { abiContract } from './abi';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [ethBalance, setEthBalance] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState(false);

  const detectCurrentProvider = () => {
    let provider;

    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      provider = window.web4.detectCurrentProvider;
    } else {
      console.log('Debes instalar Metamask primero');
    }

    return provider;
  }

  const onConnect = async () => {
    try {
      const currrentProvider = detectCurrentProvider();

      if (currrentProvider) {
        await currrentProvider.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(currrentProvider);
        const userAccount = await web3.eth.getAccounts();
        const account = userAccount[0];
        let ethBalance = await web3.eth.getBalance(account)
          .then(result => web3.utils.fromWei(result, "ether"));

        setIsConnected(true);
        setEthBalance(ethBalance);
        setWalletAddress(account);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const onDisconnect = () => {
    setIsConnected(false);
  }

  const web3 = new Web3(window.ethereum);

  // instanciamos el contrato
  const CONTRACT_ADDRESS = "0xe0cf8d61d122804b81a40325a07ae1701833a4c1";
  const contract = new web3.eth.Contract(abiContract, CONTRACT_ADDRESS);

  const onMint = async () => {
    try {
      // Prompt al usuario para que conecte con Metamask wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Obtener la dirección del usuario
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      // llamamos a safeMint
      await contract.methods.safeMint(userAddress, "").send({ from: userAddress });

      // mostramos nuevo status
      setStatus("Txn Exitosa! Consulte etherscan.io")
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="app_container">
      <div className="app-header">
        <h1>Metamask Front-End Login 🦊</h1>
      </div>
      <div className="app-wrapper">
        {(!isConnected) ? (
          <div className='button_login_container'>
            <button className="app_button" onClick={onConnect}>
              Login
            </button>
          </div>
        ) : (
          <div className="app-wrapper">
            <div className="app-details">
              <h3 className='connect_msg'>
                {
                  "Connected: " +
                  String(walletAddress).substring(0, 6) +
                  "..." +
                  String(walletAddress).substring(38)
                }
              </h3>
              <div className="balance_container">
                <span className='balance_title'>Balance: </span>
                {ethBalance}
              </div>
            </div>
            <div className='button_mint_container' onClick={onMint}>
              <button className="mint_button">
                Mint NFT
              </button>
              <p className='status'>{status}</p>
            </div>
            <div className='button_logout_container'>
              <button className="app_button" onClick={onDisconnect}>
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
