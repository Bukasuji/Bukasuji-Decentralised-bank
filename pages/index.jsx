import abi from '../utils/BukasujiBank.json';
import { ethers } from "ethers";
import Head from 'next/head'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x36a950596d43678a3d0748ef4940e07a2bd4be23";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [responseMsg, setResponseMsg] = useState();

  const onAmtInputHandler = (e) => {
      const { value } = e.target;
          if (value <= 100 && value.length < 5) {
             setAmount(value);
          }
  };

  
  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);
      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
        alert("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("please install MetaMask");
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  
  //function for fund deposit
  const depositFund = async () => {
    const { ethereum } = window;
    if (ethereum) {
      console.log('depositing')
      setResponseMsg(`Depositing.... please wait`);
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const tx = await contract.deposit({
          value: ethers.utils.parseEther(amount),
          from: currentAccount,
        })
        await tx.wait();
        console.log("successful", tx.hash);
        setResponseMsg(
          `ETH deposited, here is your receipt: ${tx.hash}`
        );
      } catch (error) {
        console.error("Transaction error:", error);
        alert(`Transaction error`);
      }
    }
    else {
      console.error("no web3 provider found, kindly install metamask")
    }

  }
  
  
  //function to withdraw fund from the bank, it takes amount as parameter
  const handleWithdraw = async () => {
    const { ethereum } = window;
    if (ethereum) {
      console.log('withdrawing')
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        if (amount > 0 && amount <= await contract.balances(currentAccount)) {
          const tx = await contract.withdraw(ethers.utils.parseEther(amount))
          await tx.wait();
          console.log("Transaction successful");
        } else {
          console.error("Invalid amount or insufficient balance");
          alert("Invalid amount or insufficient balance")
        }
      } catch (error) {
        console.error("Transaction error:", error);
        alert("Transaction error");
      }
    }
    else {
      console.error("no web3 provider found, kindly install metamask");
    }
 };


  //function for user to check balance
  const checkBalance = async () => {
    const { ethereum } = window;
    if (ethereum) {
      console.log("fetch balance")
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const balance = await contract.checkBalance();
        console.log("fetched!");
        console.log(`Your balance is ${balance} WEI.`);
        setResponseMsg(`Your balance is ${balance} WEI.`
        );
      } catch (error) {
        console.log(error);
        alert("error, fetching your balance")
      }
    }
    else {
      console.log("Metamask is not connected");
    }
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Dibank</title>
        <meta name="description" content="Defi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
       
      <nav className={styles.connectSign}>
        <div>
         <button onClick={connectWallet} className=
              {styles.connectButton2}> Connect your wallet </button>
        </div>
         
        <div className={styles.connectStatus}>
          {currentAccount !== "" ? "Connected to" : "Not Connected. Please connect to transact"} {currentAccount !== "" ? (currentAccount.substring(0, 15) + '...') : ""}
        </div>  
      </nav>


      <main className={styles.main}>
        <h1 className={styles.title}>
              Bukasuji <span className={styles.dbank}> Dbank </span>
        </h1>
        <p className={styles.description}>The future bank is here &#128640; </p>
        
        {currentAccount ? (
          <div>
              <form noValidate className={styles.log}>
                <p>User ID: {currentAccount} </p>
             
                <div>
                    <label htmlFor="depositAmount">Amount ETH</label>
                    <input
                      type="number"
                      id="depositAmount"
                      min={0.01}
                      step={0.01}
                      onChange={onAmtInputHandler}
                      value= {amount}
                      placeholder="minimum amount 0.01ETH"
                    />
                </div>
                
                <div className={styles.depoWithdrawBtn}>
                    <button className={styles.depo} type='button' onClick={depositFund} >
                          Deposit
                    </button>
                    <button className={styles.withdrawBtn} type="button" onClick=
                           {handleWithdraw}>
                            withdraw
                    </button>
                </div>
                <span className={styles.responseMsg}>{responseMsg}</span>
                <div className={styles.balanceBtn}>
                  <button id="getDonationBalance" type="button" onClick=
                           {checkBalance}>
                           check balance
                  </button>
                </div>
              </form>
          </div>
        ) : (
            <button className={styles.connectButton} onClick={connectWallet}> Connect your wallet </button>
          )}
      </main>
    
      <footer className={styles.footer}>
       <span>Created by: </span> <p> Chukwuebuka Osuji for Grandida LLC assessment project!</p>
      </footer>    
    </div>
  )
}

