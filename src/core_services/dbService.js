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
                    HotelNftId TEXT NOT NULL UNIQUE,
                    Name TEXT,
                    Address TEXT,
                    Email TEXT,
                    IsRegistered INTEGER DEFAULT 1 NOT NULL,
                    PRIMARY KEY("Id" AUTOINCREMENT)
                    )`);

            await this.#runQuery(`CREATE TABLE IF NOT EXISTS Rooms (
                        Id INTEGER,
                        HotelId INTEGER,
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

            await this.#insertData();
            this.#db.close();
        }
    }

    static async #insertData() {

        // Inserting hotels
        let hotels = `INSERT INTO Hotels(Id, HotelNftId, Name, Address, Email, IsRegistered) VALUES 
                        (1, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65", "Hotel1", "Loca1", "test1@gmail.com", 1),
                        (2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D66", "Hotel2", "Loca2", "test2@gmail.com", 1),
                        (3, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D67", "Hotel3", "Loca3", "test3@gmail.com", 1)`;

        await this.#runQuery(hotels);

        // Inserting Rooms
        let rooms = `INSERT INTO Rooms(Id, HotelId, Name) VALUES
                        (1, 1, "Room1"),
                        (2, 1, "Room2"),
                        (3, 1, "Room3"),
                        (4, 2, "Room1"),
                        (5, 2, "Room2"),
                        (6, 2, "Room3"),
                        (7, 2, "Room4"),
                        (14, 1, "Room4"),
                        (8, 1, "Room5"),
                        (9, 1, "Room6"),
                        (10, 1, "Room7"),
                        (11, 3, "Room1"),
                        (12, 3, "Room2"),
                        (13, 2, "Room5")`;
        await this.#runQuery(rooms);

        // Inserting Bookings
        let bookings = `INSERT INTO Bookings(Id, RoomId, PersonName, FromDate, ToDate) VALUES
                            (1, 1, "User1", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208", "2022-8-31", "2022-9-2"),
                            (2, 1, "User2", "000B013A95F14B0044F78A264E41713C64B5F89242540EE210", "2022-9-3", "2022-9-5"),
                            (3, 5, "User3", "000B013A95F14B0044F78A264E41713C64B5F89242540EE209",  "2022-8-31", "2022-9-2")`;
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