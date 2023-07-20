const express = require("express");
const app = express();
const path = require("path");
const sql = require("mssql");
const { Connection, Request, TYPES } = require("tedious");

app.set("view engine", "ejs");

// body-parser middleware'ini kullanma
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
	res.render("index");
});

app.use(
	"/css",
	express.static(path.join(__dirname, "/css"), {
		maxAge: 31557600000,
		setHeaders: function (res, path) {
			res.setHeader("Content-Type", "text/css");
		},
	})
);

// helpers klasöründeki js dosyalarını ekledik
app.use("/helpers", express.static(path.join(__dirname, "helpers")));
app.use(express.static(path.join(__dirname, "")));
// SQL Bağlantı
const config = {
	server: "localhost",
	database: "master",
	port: 1433,
	authentication: {
		type: "default",
		options: {
			userName: "sa",
			password: "1234",
		},
	},
	options: {
		encrypt: true,
		trustServerCertificate: true,
		enableArithAbort: true,
	},
};

const connection = new sql.ConnectionPool(config);

app.get("/createdb", function (req, res) {
	connection.connect(function (err) {
		if (err) throw err;

		const checkDbQuery = `USE master; SELECT COUNT(*) AS dbCount FROM sys.databases WHERE name = 'Products'`;

		const createDbQuery = "CREATE DATABASE Products ";

		const createTableQuery = `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND type in (N'U')) USE Products; CREATE TABLE [dbo].[Products] ([Id] INT IDENTITY(1,1) PRIMARY KEY, [ProductName] VARCHAR(100), [ProductType] VARCHAR(100), [ProductDescription] VARCHAR(500), [ProductImage] VARCHAR(500), [Brand] VARCHAR(100), [Stock] INT, [Price] DECIMAL(18, 2), [Currency] VARCHAR(10), [VATRate] DECIMAL(18, 2))`;

		const request = new sql.Request(connection);
		request.query(checkDbQuery, function (err, result) {
			if (err) throw err;

			const dbCount = result.recordset[0].dbCount;

			if (dbCount === 0) {
				request.query(createDbQuery, function (err, result) {
					if (err) throw err;

					console.log("Veritabanı oluşturuldu!");

					request.query(createTableQuery, function (err, result) {
						if (err) throw err;

						console.log("Tablo oluşturuldu!");
						connection.close();
					});
				});
			} else {
				request.query(createTableQuery, function (err, result) {
					if (err) throw err;

					console.log("Tablo oluşturuldu!");
					connection.close();
				});
			}
		});
	});

	res.redirect("/");
});

// Inputtan gelen verileri çekip sql'e gönderme
// Ürün ve fiyat ekleme için POST isteği rota tanımlaması
app.post("/addData", async (req, res) => {
	const {
		productName,
		productType,
		productDescription,
		productImage,
		brand,
		stock,
		price,
		currency,
		vatRate,
	} = req.body;

	// SQL Bağlantı
	var config = {
		server: "localhost",
		database: "master",
		port: 1433,
		authentication: {
			type: "default",
			options: {
				userName: "sa",
				password: "1234",
			},
		},
		options: {
			encrypt: true,
			trustServerCertificate: true,
			enableArithAbort: true,
		},
	};

	try {
		// MSSQL veritabanına bağlanın
		await sql.connect(config);

		// Ürün bilgilerini MSSQL veritabanına ekleyin
		await sql.query`
      USE Products;
      INSERT INTO Products (ProductName, ProductType, ProductDescription, ProductImage, Brand, Stock, Price, Currency, VATRate)
      VALUES (${productName}, ${productType}, ${productDescription}, ${productImage}, ${brand}, ${stock}, ${price}, ${currency}, ${vatRate});
    `;

		res.send("Ürün ve fiyat başarıyla eklendi.");
	} catch (error) {
		console.error("Ürün ve fiyat ekleme hatası:", error);
		res.status(500).send("Ürün ve fiyat ekleme hatası.");
	}
});

app.listen(8080, () => {
	console.log("Server is running.. PORT: 8080");
});
