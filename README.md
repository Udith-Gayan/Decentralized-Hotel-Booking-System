# Smart Hotel Booking System
This is a decentralized hotel booking system, running on evernode clusters, integrating with XRPL, as a Proof of Concept.


# Introduction
This repository contains two projects,
<br>
1. Hotel booking client application
2. Hotel booking smart contract
   
The users can interact with the smart contract through the client application which is a web application developed with React.js. 
The smart contract can run on the Evernode platform which has been built on the XRP Ledger.

# 1. Hotel Booking Smart Contract

This is a nodeJS application that is capable of handling requests coming from the client web application, running the relevant logic, connecting with the XRP ledger and an internal database and sending the responses back to the web application.
 We use web sockets for communication between the client app and the contract. 

## The project structure
The project structure is similar to a typical NodeJS application. .
```
booking_contract
├── dist
│   ├── build
│   ├── hp.cfg.override
│   ├── index.js
│   └── lib
├── package.json
├── package-lock.json
├── README.md
└── src
    ├── booking_contract.js
    ├── core_services
    │   ├── dbService.js
    │   ├── defaults.js
    │   ├── event-emitter.js
    │   ├── evernode-common.js
    │   ├── sqlite-handler.js
    │   ├── transaction-helper.js
    │   ├── xrpl-account.js
    │   ├── xrpl-api.js
    │   └── xrpl-common.js
    ├── services
    │   ├── api-service.js
    │   └── transaction-service.js
    └── settings.json
```

The **_core-services_** folder contains the helper-service classes to connect with SQlite database and XRP ledger. 

The **_booking_contract.js_** file is the starting point of the contract and during every round of the consensus, this smart contract runs from the beginning.
```javascript
const HotPocket = require("hotpocket-nodejs-contract");
const { ApiService } = require('./services/api-service');
const { DbService } = require("./core_services/dbService");

const booking_contract = async (ctx) => {
    console.log('Hotel Reservation Smart Contract is running.');
    const isReadOnly = ctx.readonly;

    const apiService = new ApiService();
    await DbService.initializeDatabase();

    for (const user of ctx.users.list()) {

        // Loop through inputs sent by each user.
        for (const input of user.inputs) {

            // Read the data buffer sent by user (this can be any kind of data like string, json or binary data).
            const buf = await ctx.users.read(input);

            // Let's assume all data buffers for this contract are JSON.
            const message = JSON.parse(buf);

            // Pass the JSON message to our application logic component.
            await apiService.handleRequest(user, message, isReadOnly);

        }

    }
}


const hpc = new HotPocket.Contract();
hpc.init(booking_contract);
```
In this application, we transfer data as json objects. Once a request comes from a user to the contract, we catch the input inside a _while_ loop and parsed json object is then passed to the _apiService_ class for further process.

ApiService class in api-service.js file acts as a controller class in a usual backend API project.
```javascript
 if (message.type == 'hotelRegistration') {                                     //------------------- Register Hotel (hotelRegRequest, hotelRegConfirm) ------------------------------------
            result = await this.#transactionService.handleTransaction();
        }
        else if (message.type == 'getHotels') {                                             //---------------------Get hotels(with filters)-----------------------
            result = await this.#transactionService.getHotels();
        }
        else if (message.type == 'createRoom') {                                            //------------------- Create Room --------------------------------------
            result = await this.#transactionService.createRoom();
        }
        else if (message.type == 'getRoomsByHotel') {                                        //-------------------- Get rooms of a hotel-------------------------
            const hotelId = message.data.hotelId;
            result = await this.#transactionService.getRoomsByHotel(hotelId);
        }
        else if (message.type == 'makeBooking') {                                        //--------------------Make a booking-----------------------------
            result = await this.#transactionService.makeReservation(user.publicKey);
        }
        else if (message.type == 'getAllBookings') {                                     //------------------ Get all bookings (with filters)----------------------------------
            result = await this.#transactionService.getAllBookings();
        }
        else if (message.type == 'getAllBookingsByUser') {                                     //------------------ Get all bookings of a User----------------------------------
            result = await this.#transactionService.getAllBookings(user.publicKey);
        }
        else if (message.type == 'transactions') {                                      //---------------------- Transaction Handler----------------------------
             result = await this.#transactionService.handleTransaction();
        }

        if(isReadOnly){
            await this.sendOutput(user, result);
        } else {
            await this.sendOutput(user, {promiseId: message.promiseId, ...result});
        }
```

In the json message we send a field named 'type' which is used to identify the request type. According to the message type, we pass the request to the relevant method for processing.

In **_transaction-service.js_** file, we can find several methods.
<br>
The constructor method is used to initialize the connections to the XRPL and database.
```javascript
constructor(message) {
        this.#message = message;
        this.#xrpl = new XrplApi('wss://hooks-testnet-v2.xrpl-labs.com');
        this.#contractAcc = new XrplAccount(settings.contractWalletAddress, settings.contractWalletSecret, { xrplApi: this.#xrpl });
        this.#db = new SqliteDatabase(this.#dbPath);
    }
```
- requestHotelRegistration()<br>
  In this method, once a hotel registration request comes from the client app with hotel details, the details are saved in the database first. And an available NFTSellOffer ID and the DB record ID are sent to the client app.

- confirmHotelRegistration()<br>
  Once the cliet app accepts the NFTSellOffer successfully, this method is called and this marks the hotel as a suceessfuly registered hotel in the DB.

The contract has its own XRPL wallet which is used to mint Hotel Registration tokens and sell them. For now, we use the default XRP as the currency for the transactions with hotel wallets.

The **_sqlite-handler.js_** is used to execute database queries.
We use some methods written in xrpl helper class files for now bt the rest will be used in future developments of the project.

