const xrpl = require("xrpl")
const { SqliteDatabase, DataTypes } = require("../core_services/sqlite-handler")
// const { DbService } = require("../core_services/dbService");
const { TransactionService } = require('./transaction-service');
const settings = require('../settings.json').settings;

export class ApiService {

    dbPath = settings.dbPath;
    #transactionService = null;

    constructor() {
        console.log(settings.dbPath);
        // new DbService();
        this.db = new SqliteDatabase(this.dbPath);
    }

    async handleRequest(user, message, isReadOnly) {

        this.db.open();
        this.#transactionService = new TransactionService(message);
        // This sample application defines two simple messages. 'get' and 'set'.
        // It's up to the application to decide the structure and contents of messages.
        if (message.type == 'get') {

            // Define the network client
            const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
            await client.connect()

            // ... custom code goes here
            // Create a wallet and fund it with the Testnet faucet:
            const fund_result = await client.fundWallet()
            const test_wallet = fund_result.wallet
            console.log(fund_result)

            // Listen to ledger close events
            client.request({
                "command": "subscribe",
                "streams": ["ledger"]
            })
            let ledgerEvent = {}
            client.on("ledgerClosed", async (ledger) => {
                console.log(`Ledger #${ledger.ledger_index} validated with ${ledger.txn_count} transactions!`);
                console.log('ledger details\n');
                ledgerEvent = ledger
            })

            await this.sendOutput(user, ledgerEvent);
            // Disconnect when done (If you omit this, Node.js won't end the process)
            // client.disconnect()

        }
        else if (message.type == 'hotelRegistration') {                                     //------------------- Register Hotel (hotelRegRequest, hotelRegConfirm) ------------------------------------
            let result = await this.#transactionService.handleTransaction();
            await this.sendOutput(user, result);
        }
        else if (message.type == 'createRoom') {                                            //------------------- Create Room --------------------------------------
            let result = await this.#transactionService.createRoom();
            await this.sendOutput(user, result);
        }
        else if (message.type == 'getRoomsByHotel') {                                        //-------------------- Get rooms of a hotel-------------------------
            const hotelId = message.data.hotelId;
            const result = await this.#transactionService.getRoomsByHotel(hotelId);
            await this.sendOutput(user, result);
        }
        else if (message.type == 'makeBooking') {                                        //--------------------Make a booking-----------------------------
            const result = await this.#transactionService.makeReservation(user.publicKey);
            await this.sendOutput(user, result);
        }
        else if (message.type == 'getAllBookings') {                                     //------------------ Get all bookings----------------------------------
            let result = this.#transactionService.getAllBookings();
            await this.sendOutput(user, result);
        }
        else if (message.type == 'transactions') {                                      //---------------------- Transaction Handler----------------------------
            let result = await this.#transactionService.handleTransaction();
            await this.sendOutput(user, result);
        }
        else if (message.type == 'getAllHotels') {                                          //------------------- Get all hotels ------------------------------------
            console.log('Received GetAllHotels Request');
            let hotelList = [];
            let filters = message.filters ? message.filters : null;
            if (await this.db.isTableExists('Hotels')) {
                try {
                    hotelList = await this.db.getValues('Hotels', filters);
                } catch (e) {
                    console.log(`Error occured in retrieving all hotels: ${e}`);
                    await this.sendOutput(user, `Error occured in retrieving all hotels: ${e}`)
                }
            } else {
                console.log('Table "Hotel" not found.');
                await this.sendOutput(user, 'Table "Hotel" not found.')
            }
            await this.sendOutput(user, JSON.stringify(hotelList));
        }
        else if (message.type == 'createRoom') {                                             //------------------- Create a room ------------------------------------
            console.log('Requested to create a room');
            let data = {
                HotelId: message.data.hotelId,
                Name: message.data.name
            }
            if (await this.db.isTableExists('Rooms')) {
                try {
                    await this.db.insertValue('Rooms', data);

                } catch (e) {
                    console.log(`Error occured in room creation: ${e}`);
                    await this.sendOutput(user, `Error occured in room creation: ${e}`)
                }
            } else {
                console.log('Table "Rooms" not found.');
                await this.sendOutput(user, 'Table "Rooms" not found.')
            }
            await this.sendOutput(user, 'Room created successfully.');
        }
        else if (message.type == 'getRooms') {                                               //------------------- Get all Rooms ------------------------------------
            console.log('Received GetAllRooms Request');
            let filters = message.filters ?? null;
            let roomList = [];
            if (await this.db.isTableExists('Rooms')) {
                try {
                    roomList = await this.db.getValues('Rooms', filters);
                } catch (e) {
                    console.log(`Error occured in retrieving all Rooms: ${e}`);
                    await this.sendOutput(user, `Error occured in retrieving all Rooms: ${e}`)
                }
            } else {
                console.log('Table "Rooms" not found.');
                await this.sendOutput(user, 'Table "Rooms" not found.')
            }
            await this.sendOutput(user, roomList);
        }
        else if (message.type == 'searchHotel') {                                              //------------------- Search Hotels by ------------------------------------
            console.log('Serching  hotels by');
            let filters = message.filters ?? null;
            let hotelList = [];
            if (await this.db.isTableExists('Hotels')) {
                try {
                    hotelList = await this.db.getValues("Hotels", filters);
                } catch (e) {
                    await this.sendOutput(user, `Error occured in searching hotels: ${e}`)
                }
            }
            else {
                console.log('Table "Hotel" not found.');
                await this.sendOutput(user, 'Table "Hotel" not found.')
            }
            await this.sendOutput(user, JSON.stringify(hotelList));

        }
        else if (message.type == 'makeBooking2') {                                             //------------------- Make Bookings ------------------------------------
            console.log("Creating a reservation");
            let data = {
                roomId: message.data.roomId,
                personName: message.data.personName,
                userPubkey: user.userPubkey,
                fromDate: message.data.fromDate,
                toDate: message.data.toDate
            }
            if (await this.db.isTableExists('Bookings')) {
                try {
                    await this.db.insertValue("Bookings", data);
                    await this.sendOutput(user, "Booking successful.");
                } catch (e) {
                    await this.sendOutput(user, `Error in making the booking`)
                }
            }
            else {
                await this.sendOutput(user, "Booking table not found.")
            }
        }

        this.db.close();
    }

    sendOutput = async (user, response) => {
        await user.send(response);
    }



}