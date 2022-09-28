const sqlite3 = require('sqlite3').verbose();
const settings = require('../settings.json').settings;
const fs = require('fs')


// //create the database if does not exists
// let db = new sqlite3.Database(settings.dbPath);

export class DbService {

    static #db = null;

    static async initializeDatabase() {

        if (this.#db == null && !fs.existsSync(settings.dbPath)) {
            this.#db = new sqlite3.Database(settings.dbPath);
            await this.#runQuery(`CREATE TABLE IF NOT EXISTS Hotels (
                    Id INTEGER,
                    HotelWalletAddress TEXT NOT NULL UNIQUE,
                    HotelNftId TEXT NOT NULL UNIQUE,
                    Name TEXT,
                    Address TEXT,
                    Email TEXT,
                    IsRegistered INTEGER DEFAULT 0,
                    PRIMARY KEY("Id" AUTOINCREMENT)
                    )`);

            await this.#runQuery(`CREATE TABLE IF NOT EXISTS Rooms (
                        Id INTEGER,
                        HotelId INTEGER,
                        RoomNftId TEXT NOT NULL UNIQUE,
                        Name TEXT NOT NULL,
                        PRIMARY KEY("Id" AUTOINCREMENT),
                        FOREIGN KEY (HotelId) REFERENCES Hotels (Id)
                        )`);

            await this.#runQuery(`CREATE TABLE IF NOT EXISTS Bookings (
                Id INTEGER,
                RoomId INTEGER,
                PersonName TEXT NOT NULL,
                UserPubkey Text Not NULL,
                FromDate DATE,
                ToDate DATE,
                PRIMARY KEY("Id" AUTOINCREMENT),
                FOREIGN KEY (RoomId) REFERENCES Rooms (Id)
                )`)

            // await this.#insertData();
            this.#db.close();
        }
    }

    static async #insertData() {

        // Inserting hotels
        let hotels = `INSERT INTO Hotels(Id, HotelWalletAddress, HotelNftId, Name, Address, Email, IsRegistered) VALUES 
                        (1, "rpnzMDvKfN1ewJs4ddSRXFFZQF6Ubmhkqx", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65", "Hotel Mandara Rosen", "Kataragama", "test1@gmail.com", 1),
                        (2, "rfKk9cRbspDzo62rbWniTMQX93FfCt8w5o", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D66", "Hotel Hilton", "Colombo 1", "hilton.lk@gmail.com", 1),
                        (3, "rLkLngcLBKfiYRL32Ygk4WYofBudgii3zk", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D67", "Hotel Galadari", "Colombo 1", "galadari@gmail.com", 1)`;

        await this.#runQuery(hotels);

        // Inserting Rooms
        let rooms = `INSERT INTO Rooms(Id, HotelId, RoomNftId, Name) VALUES
                        (1, 1, "000B013A95F14B0044F78A264E41713C64B5F8924254055E208C3098E00000D65", "Sea-View Room"),
                        (2, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D33", "Coconut-Grove Room"),
                        (3, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540EEDD08C3098E00000D65", "Presidential Room"),
                        (4, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE20866098E00000D65", "Presidential Room"),
                        (5, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208CFEWF98E00000D65", "Beach-View Room"),
                        (6, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208VDFV98E00000D65", "Ever-Green Room"),
                        (7, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208CVD098E00000D65", "Double Bed Room"),
                        (14, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540VDFDFDFF098E00000D65", "Tripple Bed Room"),
                        (8, 1, "000B013A95F14B0044F78A264E41713C64B5F892425SDDSFDFDC3098E00000D65", "Single Bed Room"),
                        (9, 1, "000B013A95F14B0044F78A264E41713C64B5F89242SDCVDSSDVC3098E00000D65", "Single Bed Green View Room"),
                        (10, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65", "Non-AC Room"),
                        (11, 3, "000B013A95F14B0044F78A264E41713C64B5F89242540EEFVDV3098E00000D65", "Presidential Room"),
                        (12, 3, "000B013A95F14B0044F78A264E41713C64B5F892425VDFVFVDF3098E00000D65", "Single Bed Room"),
                        (13, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208D3098E00000D65", "Sea-View Blue Room")`;
        await this.#runQuery(rooms);

        // Inserting Bookings
        let bookings = `INSERT INTO Bookings(Id, RoomId, PersonName, UserPubkey, FromDate, ToDate) VALUES
                            (1, 1, "Andrew", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208", "2022-8-10", "2022-8-15"),
                            (2, 1, "Ravi", "000B013A95F14B0044F78A264E41713C64B5F89242540EE210", "2022-9-3", "2022-9-10"),
                            (3, 5, "Perera", "000B013A95F14B0044F78A264E41713C64B5F89242540EE209",  "2022-8-31", "2022-9-2")`;
        await this.#runQuery(bookings);
    }

    static #runQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.#db.run(query, params ? params : [], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({ lastId: this.lastID, changes: this.changes });
            });
        });
    }


}