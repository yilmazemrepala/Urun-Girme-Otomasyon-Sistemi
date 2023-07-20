const express = require("express");
const app = express();
const path = require("path");
const sql = require("mssql");

// Tedious, SQL Server veritabanıyla iletişim kurmak için kullanılan bir pakettir
const { Connection, Request, TYPES } = require("tedious");

// Frontend engine olarak EJS kullanılacağı belirtilir
app.set("view engine", "ejs");

// req.body için gerek. Express ara yazılımı (middleware) kullanılır.  Bu sayede, gelen verilere kolayca erişebilir ve işleyebilirsiniz.
app.use(express.json());

// bu ara yazılım, gelen isteklerdeki URL kodlu form verilerini (URL-encoded form data) ayrıştırmak ve req.body nesnesine dönüştürmek için kullanılır.
app.use(express.urlencoded({ extended: true }));

// böylelikle localhost "/" rotasında index.html'i kullanabiliyoruz
app.get("/", function (req, res) {
	res.render("index");
});

//css dizinine istek yapıldığında CSS dosyalarının sunulması sağlanmıştır.
app.use("/css", express.static(path.join(__dirname, "/css")));

// helpers klasöründeki js dosyalarını ekledik
app.use("/helpers", express.static(path.join(__dirname, "helpers")));

// Veritabanı bağlantı bilgileri
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

// config işlemini bir parametreye atıyoruz ve gereksiz yere her seferinde yazmıyoruz
const connection = new sql.ConnectionPool(config);

// Ürün ve fiyat ekleme için POST isteği rota tanımlamasını yapıyoruz
app.post("/addData", async (req, res) => {
	// Inputtan gelen verileri çekiyoruz ve req.body üzerinden gelen istek verilerini alarak değişkenlere atama işlemini gerçekleştirdik.
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

	try {
		// MSSQL veritabanına bağlanın
		await connection.connect();

		// template strings ile yazıyoruz
		const checkDbQuery = `USE master; SELECT COUNT(*) AS dbCount FROM sys.databases WHERE name = 'Products'`;

		const createDbQuery = "CREATE DATABASE Products";

		const createTableQuery = `
		USE Products;
		IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND type in (N'U'))
		BEGIN
			CREATE TABLE [dbo].[Products] (
				[Id] INT IDENTITY(1,1) PRIMARY KEY,
				[ProductName] VARCHAR(100),
				[ProductType] VARCHAR(100),
				[ProductDescription] VARCHAR(500),
				[ProductImage] VARCHAR(500),
				[Brand] VARCHAR(100),
				[Stock] INT,
				[Price] DECIMAL(18, 2),
				[Currency] VARCHAR(10),
				[VATRate] DECIMAL(18, 2)
			)
		END
		`;

		// burada her seferinde bağlanmızı ve her defasında request ve bağlantı isteğini yapmanın önüne geçiyoruz
		const request = new sql.Request(connection);

		// Bu kod, belirli bir veritabanının var olup olmadığını kontrol etmek için SQL sorgusunu yürütür ve sonucu elde eder.
		const result = await request.query(checkDbQuery);

		// veritabanının var olup olmadığını kontrol etmek ve sonucu dbCount değişkeninde sakladık.
		const dbCount = result.recordset[0].dbCount;

		// eğer veri tabanı yoksa hem veritabanını hem tabloyu oluştur.
		if (dbCount === 0) {
			await request.query(createDbQuery);
			console.log("Veritabanı oluşturuldu!");
			await request.query(createTableQuery);
			console.log("Tablo oluşturuldu!");
		}

		// Tablomuzu ve ona karşılık gelen inputları girdik. template strings ile yazıyoruz
		await request.query`
			USE Products;
			INSERT INTO Products (ProductName, ProductType, ProductDescription, ProductImage, Brand, Stock, Price, Currency, VATRate)
			VALUES (${productName}, ${productType}, ${productDescription}, ${productImage}, ${brand}, ${stock}, ${price}, ${currency}, ${vatRate});
		`;

		console.log("Ürün ve fiyat başarıyla eklendi.");

		connection.close();

		// Hataları yakalıyoruz
	} catch (error) {
		if (error.code === "EREQUEST" && error.number === 8114) {
			// Boş satırlar bırakma hatası olduğunda uyarı mesajı gönder
			console.error("Ürün Ekleme Hatası! Bazı satırları boş bıraktınız...");

			/*
			burada mevcut hataları gösteriyoruz
			// Hata yönetimi
			console.error("Hata oluştu:", error);
			*/
		} else {
			// Diğer hataları normal şekilde fırlat
			throw error;
		}
	}

	// her istekten sonra "/" rotasına yönlendiriyoruz. yani ana sayfaya atıyoruz. kodumuzda ise yenileme işlemine yarıyor.
	res.redirect("/");
});

// Localhost portumuz.
app.listen(9090, () => {
	console.log("Server is running.. PORT: 9090");
});
