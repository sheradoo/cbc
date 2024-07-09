import dotenv  from "dotenv";
import { TronWeb, utils as TronWebUtils, Trx, TransactionBuilder, Contract, Event, Plugin, providers, utils } from 'tronweb';
import { mnemonicToSeed } from 'bip39';
import pkg from 'bip32';
const { BIP32Factory, BIP32Interface } = pkg;
import * as ecc from 'tiny-secp256k1';
const bip32 = BIP32Factory(ecc);
import config from '../config/_config.js';
dotenv.config({path: './config/.env'});


const tronWeb = new TronWeb({
  fullHost: config.TRON_NETWORK,
  solidityNode: config.TRON_NETWORK,
  eventServer: config.TRON_NETWORK,
});  




// Controller for getting token balance
export const getTokenBalance = async () => {

        const CONTRACT = "TBqko9QNCiiezXuX1pom4BY5bcBMX2vePw"; //req.query.contAdd;
        const ACCOUNT = "TEpmxQkt4eQZ8PxfKcSfL77ZnWpejHZZ9G";  //req.query.address

        // set the owner address
        tronWeb.setAddress(CONTRACT);

        const { abi } = await tronWeb.trx.getContract(CONTRACT);
        let contract = tronWeb.contract(abi.entrys, CONTRACT);

        const balance = await contract.balanceOf(ACCOUNT).call();
        const name = await contract.name().call();
        const tokenSymbol = await contract.symbol().call();
        const decimal = await contract.decimals().call();
        const formatedBal = tronWeb.fromSun(balance.toString(), decimal);


        const data = {
            balance: balance.toString(),
            formatedBal: formatedBal,
            decimal: decimal,
            TokenName: name,
            tokenSymbol: tokenSymbol
        };
        //console.log(data);

    return data;
};

//https://api.shasta.trongrid.io/v1/contracts/TBqko9QNCiiezXuX1pom4BY5bcBMX2vePw/tokens
export const getTokenDetails = async () => {
  try {
    const CONTRACT = "TBqko9QNCiiezXuX1pom4BY5bcBMX2vePw"; //req.query.contAdd;
    const ACCOUNT = "TEpmxQkt4eQZ8PxfKcSfL77ZnWpejHZZ9G";  //req.query.address

    // set the owner address
        tronWeb.setAddress(CONTRACT);

    const contract = await tronWeb.contract().at(CONTRACT);
    const decimal = await contract.decimals().call();
    const TokenName = await contract.name().call();
    const tokenSymbol = await contract.symbol().call();
    const balance = await contract.balanceOf(ACCOUNT).call();
    const totalSupply = await contract.totalSupply().call();

    const data = {
            balance: balance.toString(),
            totalSupply: tronWeb.toBigNumber(totalSupply).toString(),
            decimal: decimal.toString(),
            TokenName: TokenName,
            tokenSymbol: tokenSymbol,
            tokenUnit: process.env.TOKENUNIT,
            usdPrice: process.env.USDPRICE
        };

    return data;

  } catch (error) {
    console.error('Error fetching token details:', error);
  }
}


// Controller for sending token to address
export const sendTokenToAddr = async (req, res) => {
    try {

          const to  = "TUATrKeD2x22nrX6nVgiRSnYdLCGjA9zRc";
          const from  = "TEpmxQkt4eQZ8PxfKcSfL77ZnWpejHZZ9G";
          const amount  = 5;
          const privateKey  = "b25c2b6483c85fe82cc4239580e70ebe12669193defe56e014cf5a0b9fdecddb";

          const CONTRACT = "TBqko9QNCiiezXuX1pom4BY5bcBMX2vePw";

          const energyConstant = await tronWeb.trx.getChainParameters();
          const energyFee = energyConstant.filter(item => item.key==='getEnergyFee')[0].value;
          

          const energy = await tronWeb.transactionBuilder.estimateEnergy(
            CONTRACT, "transfer(address,uint256)",
             { feeLimit: 10000000, callValue: 0 },
             [{ type: "address", value: to}, { type: "uint256", value: (amount) * 1000000 }],
             tronWeb.address.toHex(from)
             );

          const feeLimit = energy.energy_required * energyFee;
          console.log(feeLimit);

          const options = {
            feeLimit: feeLimit,
            callValue: 0
          };

         const tx = await tronWeb.transactionBuilder.triggerSmartContract(
         CONTRACT, 'transfer(address,uint256)', options,
          [{
          type: 'address',
          value: to
          }, {
          type: 'uint256',
          value: (amount) * 1000000
         }],
         tronWeb.address.toHex(from)
        );

       const signedTx = await tronWeb.trx.sign(tx.transaction, privateKey);
       const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx);
       const url = `https://nile.tronscan.org/#/transaction/${broadcastTx.txid}`;
       console.log(broadcastTx);

          const data = {
              broadcastTx: broadcastTx.txid,
              url: url,
              energy: energy.energy_required
           };


      return res.status(200).json({ "Data": data });
    } catch (error) {
        return res.status(401).json({ "err": error.message });
    }
};