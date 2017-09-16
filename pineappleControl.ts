
import { AccountHttp, AccountListener, NEMLibrary, NetworkTypes, Address, TransactionTypes, TransferTransaction, PlainMessage, HashData } from "nem-library";

// Initialize NEMLibrary for TEST_NET Network
NEMLibrary.bootstrap(NetworkTypes.TEST_NET);

//Hotspot address to make the payment to
const HotspotAddress = new Address("TCCXQP-JNPXAZ-FKV2IZ-HIFLAG-TSN42W-PNAQI6-XGK3");

const accountHttp = new AccountHttp();

//represents a user connected to the hotspot
class User {
    account: Address;
    start: number;
    duration: number;
    constructor (account: Address, start: number, duration: number) {
        this.account = account;
        this.start = start;
        this.duration = duration;
    }
}

//list of pending payments
let currentUsers: User[] = [];

let consumedTransactions: HashData[] = [];

//Asks the hotspot for connection info
function requestConnection(){
    let pricePerHalfHour = 0.5;
    return {
        pricePerHalfHour: pricePerHalfHour,
        address: HotspotAddress
    }
}

//TODO: gives access to the internet
function grantAccess(account: Address, duration: number){
    console.log("access given to " + account.plain() + " for " + duration/(3600*1000) + " hours");
}

//TODO: revokes access to a user
function revokeAccess(account: Address){
    console.log("access revoked for " + account.plain());
}

//checks for payments sent
function checkPayments(){
    accountHttp.incomingTransactions(HotspotAddress)
    .subscribe(transactions => {
        transactions.map(transaction => {
            //skip consumed transactions
            let filteredHashes = consumedTransactions.filter(transHash => {
                return (transHash.data === transaction.getTransactionInfo().hash.data);
            });
            if(filteredHashes.length > 0){
                return;
            }
            //check if it is a pineapple transaction
            if(transaction.type == 257){
                let trans = (transaction as TransferTransaction);
                let quantity = 0;
                try {
                    let mosaics = trans.mosaics();
                    let filtered = mosaics.filter(mosaic => {
                        return (mosaic.mosaicId.namespaceId === 'pineapple') && (mosaic.mosaicId.name === 'token');
                    });
                    if(filtered.length > 0){
                        quantity = filtered[0].quantity;
                    }
                    else{
                        return;
                    }
                } catch (error) {
                    return;
                }
                //if sender is already a user dont add, we'll wait until the current connection ends
                const signer = trans.signer;
                if(!signer){
                    return;
                }
                let filteredUsers = currentUsers.filter(user => {
                    return user.account.plain() === signer.address.plain();
                });
                if(filteredUsers.length > 0){                   
                    console.log("already a user");
                    return;
                }
                else { //else add
                    //consume transaction
                    consumedTransactions.push(transaction.getTransactionInfo().hash);
                    let start = new Date().getTime();
                    const divisibility = 1;
                    let realQuantity = quantity / Math.pow(10, divisibility);
                    let duration = (realQuantity/2)*3600*1000;
                    let newUser = new User(signer.address, start, duration);
                    currentUsers.push(newUser);
                    grantAccess(newUser.account, duration);
                }
            }
        })
    });
}

//checks if users run out of time
function checkUsers(){
    currentUsers.map(user => {
        let now = new Date().getTime();
        if(user.start + user.duration <= now){
            revokeAccess(user.account);
            currentUsers = currentUsers.filter(x => x !== user);
        }
    });
}

let request = requestConnection();
console.log("--------------------");
console.log("address: " + request.address.plain());
console.log("price: " + request.pricePerHalfHour + " pineapples / half hour");
console.log("--------------------");

setInterval(function(){
    checkPayments();
    checkUsers();
    console.log("number of users: " + currentUsers.length);
}, 10000);

// SERVER
var express = require('express');
var app = express();

app.get('/', function(req: any, res: any) {
    res.send('Hello This is a pineapple');
});

app.get('/health', function(req: any, res: any) {
    res.send(requestConnection());
});

app.listen(3000, function() {
    console.log('listening on port 3000');
});
