import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

// Endereço do contrato e ABI (interface do contrato)
const contractAddress = '0x...'; // substitua pelo endereço do seu contrato
const contractABI = [/* ABI do contrato */];

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [solanaWallet, setSolanaWallet] = useState('');
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      alert('Please install MetaMask to use this dApp.');
    }
  }, []);

  const connectWallet = async () => {
    if (web3) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
        setContract(contractInstance);
        checkEligibility(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const checkEligibility = async (account) => {
    if (contract) {
      try {
        const balance = await contract.methods.balanceOf(account).call();
        const hasSoldTokens = await contract.methods.hasSoldTokens(account).call();
        if (balance >= web3.utils.toWei('100000', 'ether') && !hasSoldTokens) {
          setIsEligible(true);
        } else {
          setIsEligible(false);
        }
      } catch (error) {
        console.error('Error checking eligibility:', error);
      }
    }
  };

  const handleAddSolanaWallet = async () => {
    if (contract && isEligible) {
      try {
        await contract.methods.addSolanaWalletAddress(solanaWallet).send({ from: account });
        alert('Solana wallet address added successfully.');
      } catch (error) {
        console.error('Error adding Solana wallet:', error);
      }
    } else {
      alert('You are not eligible to add a Solana wallet.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Connect your MetaMask Wallet</h1>
        {account ? (
          <div>
            <p>Connected account: {account}</p>
            {isEligible ? (
              <div>
                <input
                  type="text"
                  placeholder="Enter your Solana wallet address"
                  value={solanaWallet}
                  onChange={(e) => setSolanaWallet(e.target.value)}
                />
                <button onClick={handleAddSolanaWallet}>Add Solana Wallet</button>
              </div>
            ) : (
              <p>You are not eligible to add a Solana wallet.</p>
            )}
          </div>
        ) : (
          <button onClick={connectWallet}>Connect MetaMask</button>
        )}
      </header>
    </div>
  );
}

export default App;
