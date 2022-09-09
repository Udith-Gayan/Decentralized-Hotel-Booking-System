const { XrplAccount } = require('./../core_services/xrpl-account');
const { XrplApi } = require('./../core_services/xrpl-api');
const { SqliteDatabase, DataTypes } = require("../core_services/sqlite-handler")
const settings = require('../settings.json').settings;

class TransactionService {
    #message = null;
    #xrpl = null;
    #contractAcc = null;
    #dbPath = settings.dbPath;
    #db = null;
    #registrationURI = 'URIRegistration';

    constructor(message) {
        this.#message = message;
        this.#xrpl = new XrplApi('wss://hooks-testnet-v2.xrpl-labs.com');
        this.#contractAcc = new XrplAccount(settings.contractWalletAddress, settings.contractWalletSecret, { xrplApi: this.#xrpl });
        this.#db = new SqliteDatabase(this.#dbPath);
    }

    async handleTransaction() {
        try {
            this.#db.open();
            await this.#xrpl.connect();

            switch (this.#message.command) {
                case 'mintRegTokens':
                    let noOfTokens = this.#message.tokenCount;
                    console.log(noOfTokens)
                    return await this.#mintCreateRegTokenOffers(noOfTokens);
                    break;
                case 'hotelRegRequest':
                    // return "{"rowId":4,"offerId":"266BF70C1E820CCD8597B99B1A31E682E7E883D4C0C2385CE71A3405C180DF79"}"
                    return await this.#requestHotelRegistration();
                    break;
                case 'hotelRegConfirm':
                    return await this.#confirmHotelRegistration();
                    break;
                default:
                    break;
            }

        } catch (error) {
            return { error: error };
        } finally {
            await this.#xrpl.disconnect();
            this.#db.close();
        }
    }

    // Creates a db record when a room nft is minted
    async createRoom() {
        const roomName = this.#message.data.name;
        const hotelId = this.#message.data.hotelId;
        let resObj = {};
        try {
            this.#db.open();
            const rowId = (await this.#db.insertValue("Rooms", { name: roomName, hotelId: hotelId })).lastId;
            resObj.success = { rowId: rowId };
        } catch (error) {
            resObj.error = `Error in creating the room ${error}`;
        } finally {
            this.#db.close();
        }
        return resObj;
    }

    async getRoomsByHotel(hotelId) {
        let resObj = {};
        try {
            this.#db.open();
            this.#xrpl.connect();

            let rooms = await this.#db.getValues("Rooms", { hotelId: hotelId });

            const hotels = await this.#db.getValues("Hotels", { id: hotelId });
            const hotelWallet = hotels[0].HotelWalletAddress;
            const hotel = new XrplAccount(hotelWallet, null, { xrplApi: this.#xrpl });
            const nftsFromHotel = await hotel.getNftsByUri(hotels[0].HotelNftId);
            const nftIds = nftsFromHotel.map(n => n.NFTokenID);

            rooms = rooms.filter(rm => nftIds.includes(rm.RoomNftId));

            const roomResult = rooms.map(rm => { return { nftId: rm.RoomNftId, roomName: rm.Name, id: rm.Id } });
            resObj.success = { rooms: roomResult };

        } catch (error) {
            resObj.error = `Error in fetching rooms: ${error}`;
        } finally {
            this.#db.close();
            this.#xrpl.disconnect();
        }

        return resObj;
    }

    // mint token and create token sell offers for those
    async #mintCreateRegTokenOffers(noOfTokens) {
        try {
            for (let i = 0; i < noOfTokens; i++) {
                // let result = await this.#contractAcc.mintNft(this.#registrationURI, 0, 2, {isBurnable: true, isTransferable: true, isOnlyXRP: true});
            }
            console.log(`${noOfTokens} tokens created for the account ${settings.contractWalletAddress}`);

            // Format of token reply
            /*  {
                Flags: 11,
                Issuer: 'rsdFny8UByHcLPHKfrwh6ozMqEk1A8T2oR',
                NFTokenID: '000B00021CE6880EC11B244F479AC3219B6803C74946C643CE1462A400000009',
                NFTokenTaxon: 0,
                TransferFee: 2,
                URI: '555249526567697374726174696F6E',
                nft_serial: 9
              }
            */

            // Getting tokens with uri
            let tokens = await this.#contractAcc.getNftsByUri(this.#registrationURI);
            let tokenIds = tokens.map(t => t.NFTokenID);
            console.log(tokens);
            console.log(tokenIds)

            // Creating sell offers for the tokens
            if (tokenIds.length !== 0) {
                // tokenIds.forEach(async id => {
                //     await this.#contractAcc.offerSellNft(id, "2", 'XRP', settings.contractWalletAddress);
                // });
                for (const id of tokenIds) {
                    await this.#contractAcc.offerSellNft(id, "2", 'XRP', settings.contractWalletAddress);
                }
            }

            // Token offer result
            /*  {
                Amount: '2',
                Expiration: 4294967295,
                Flags: 1,
                LedgerEntryType: 'NFTokenOffer',
                NFTokenID: '000B00021CE6880EC11B244F479AC3219B6803C74946C643CE1462A400000009',
                NFTokenOfferNode: '0',
                Owner: 'rsdFny8UByHcLPHKfrwh6ozMqEk1A8T2oR',
                OwnerNode: '1',
                PreviousTxnID: '91777EC1101884CDE37B70AD76E6383B9AA86D7932FAA4427FFF4D9D15E1946F',
                PreviousTxnLgrSeq: 5677814,
                index: 'FE0D54758781CC37B4BC8D491F1F18B1E74B894C593DB731ACD8B4CC14B22E06'
              }
            */

            let createdOffers = await this.#contractAcc.getNftOffers();
            console.log(createdOffers);


            return ("Good");

        } catch (e) {
            console.log("Error occured in minting tokens;");
            throw (`Error occured in minting tokens: ${e}`);
        }
    }

    async #requestHotelRegistration() {

        let resObj = {};

        let data = {
            hotelWalletAddress: this.#message.data.HotelWalletAddress,
            name: this.#message.data.Name,
            address: this.#message.data.Address,
            isRegistered: 0,
            email: this.#message.data.Email
        };

        try {
            //Serch for a free offer
            const availableOffer = await this.#getAnAvailableOffer();
            console.log('Avaialble offer: ');
            console.log(availableOffer);
            if (availableOffer != null) {
                data.hotelNftId = availableOffer.NFTokenID;

            } else {
                throw ('No available offer for registration.');
            }

            let insertedId;
            if (await this.#db.isTableExists('Hotels')) {
                try {
                    insertedId = (await this.#db.insertValue('Hotels', data)).lastId;

                } catch (e) {
                    console.log(`Error occured in hotel registration: ${e}`);
                    throw (`Error occured in hotel registration: ${e}`)
                }
            } else {
                throw ('Table "Hotel" not found.')
            }

            resObj = { rowId: insertedId, offerId: availableOffer.index }

        } catch (e) {
            resObj.error = e;
        }
        // return JSON.stringify(resObj);
        return resObj;

    }

    async #getAnAvailableOffer() {
        try {
            const createdOffers = await this.#contractAcc.getNftOffers();
            console.log(createdOffers);

            let rows = await this.#db.getValues("Hotels", null);
            let takenNfts = rows.map(r => r.HotelNftId);

            const availableOffers = createdOffers.filter(co => !takenNfts.includes(co.NFTokenID));
            return availableOffers.length == 0 ? null : availableOffers[0];

        } catch (error) {
            throw error;
        }
    }

    async #confirmHotelRegistration() {
        const rowId = this.#message.data.rowId;
        const walletAddress = this.#message.data.hotelWalletAddress;
        let resObj = {};
        try {
            const rows = await this.#db.getValues("Hotels", { id: rowId });
            if (rows.length != 0) {
                const regNftId = rows[0].HotelNftId;
                if (await this.#hasNft(walletAddress, regNftId)) {
                    // Update database
                    await this.#db.updateValue("Hotels", { isRegistered: 1 }, { id: rowId });
                }
            } else {
                throw ("Error in confirming registration. Re-register please.");
            }
            resObj.success = 'Hotel Registration Successful.'
        } catch (e) {
            resObj.error = e;
        }

        return resObj;
    }

    async #hasNft(walletAddress, nftId, byUri = null) {
        const hotel = new XrplAccount(walletAddress, null, { xrplApi: this.#xrpl });
        let tokens = await hotel.getNfts();
        if (byUri) {
            tokens = tokens.filter(t => t.URI == byUri)
        }
        const tokenIds = tokens.map(t => t.NFTokenID)
        if (tokenIds.includes(nftId))
            return true;
        else
            return false;

    }

    async makeReservation(userPubkey) {
        const roomId = this.#message.data.roomId;
        const fromDate = this.#message.data.fromDate;
        const toDate = this.#message.data.toDate;
        let resObj = {};
        try {
            this.#db.open();
            await this.#xrpl.connect();

            // Checking for date availability
            const bookings = await this.#db.getValues('Bookings', { roomId: roomId });
            const bookingDates = bookings.map(b => ({ fromDate: b.FromDate, toDate: b.ToDate }));
            console.log(bookingDates)
            let isDateAlreadyBooked = false;
            for (const d of bookingDates) {
                if (d.fromDate == fromDate || d.toDate == fromDate || (fromDate > d.fromDate && fromDate < d.toDate)) {
                    isDateAlreadyBooked = true;
                    break;
                } else if (d.fromDate == toDate || d.toDate == toDate || (toDate > d.fromDate && toDate < d.toDate)) {
                    isDateAlreadyBooked = true;
                    break;
                }
            }
            if (isDateAlreadyBooked) {
                throw ("Date Already Booked. Choose another date.");
            }

            const data = {
                roomId: roomId,
                fromDate: fromDate,
                toDate: toDate,
                personName: this.#message.data.personName,
                userPubkey: userPubkey
            }
            console.log(data);

            const rowId = (await this.#db.insertValue("Bookings", data)).lastId;
            console.log("Reservation making Success!");
            resObj.success = { rowId: rowId };

        } catch (error) {
            resObj.error = `Error in Making the Reservation: ${error}`
        } finally {
            this.#db.close();
            await this.#xrpl.disconnect();
        }

        return resObj;
    }

    async getAllBookings(userPubKey = null) {
        let filters = userPubKey == null ? null : {};
        if (this.#message.filters)
            filters = this.#message.filters;

        if (userPubKey != null)
            filters.userPubkey = userPubKey;

        let resObj = {};
        try {
            this.#db.open();
            await this.#xrpl.connect();

            const bookings = await this.#db.getValues('Bookings', filters);
            resObj.success = { bookings: bookings };

        } catch (error) {
            resObj.error = `Error in fetching bookings: ${error}`;
        } finally {
            this.#db.close();
            await this.#xrpl.disconnect();
        }

        return resObj;
    }

    async getHotels() {
        let filters = null;
        if (this.#message.filters) {
            filters = this.#message.filters;
        }

        let resObj = {};
        try {
            this.#db.open();
            await this.#xrpl.connect();

            const hotels = await this.#db.getValues('Hotels', filters);
            console.log(hotels);
            resObj.success = { hotels: hotels };

        } catch (error) {
            resObj.error = `Error in fetching hotels: ${error}`;
        } finally {
            this.#db.close();
            await this.#xrpl.disconnect();
        }

        return resObj;
    }
}



module.exports = {
    TransactionService
}