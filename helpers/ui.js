// Ürün Fotoğrafı yükleme

// Bu fonksiyon, bir dosya seçildiğinde dosya yolunu okur ve görüntüyü gösterir
function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
			$(".image-upload-wrap").hide();

			$(".file-upload-image").attr("src", e.target.result);
			$(".file-upload-content").show();
		};

		reader.readAsDataURL(input.files[0]);
	} else {
		removeUpload();
	}
}

// Bu fonksiyon, yüklemeyi kaldırır ve başlangıçtaki duruma geri döndürür
function removeUpload() {
	$(".file-upload-input").replaceWith($(".file-upload-input").clone());
	$(".file-upload-content").hide();
	$(".image-upload-wrap").show();
}
$(".image-upload-wrap").bind("dragover", function () {
	$(".image-upload-wrap").addClass("image-dropping");
});
$(".image-upload-wrap").bind("dragleave", function () {
	$(".image-upload-wrap").removeClass("image-dropping");
});

// Ürün Tipi başlığında "Stoksuz Ürün (Hizmet/Danışmanlık)" seçildiyse "Stok Adedi" başlığını disable yapar
const productTypeSelect = document.querySelector('select[name="productType"]');
const stockInput = document.querySelector('input[name="stock"]');

productTypeSelect.addEventListener("change", function () {
	if (this.value === "Stoksuz Ürün (Hizmet/Danışmanlık)") {
		stockInput.disabled = true;
	} else {
		stockInput.disabled = false;
	}
});

// ----------------------------------------

// onClick
function addData() {
	// formları birleştir
	mergeForms();

	// Boş satır bırakma
	notEmpty();
}

// Boş sayır bırakma
function notEmpty() {
	// Form alanlarını seç
	// Form alanlarını seç
	var productName = document.getElementById("productName");
	var brand = document.getElementById("brand");
	var stock = document.getElementById("stock");

	// Boş alanları kontrol et
	var isEmpty = false;
	if (productName.value === "") {
		isEmpty = true;
	}

	if (brand.value === "") {
		isEmpty = true;
	}

	// Ürün Tipi "Stoksuz Ürün" olarak seçildiyse stok alanını kontrol etme
	if (
		productTypeSelect.value !== "Stoksuz Ürün (Hizmet/Danışmanlık)" &&
		stock.value === ""
	) {
		isEmpty = true;
	}

	// Boş alan varsa submit işlemini engelle ve uyarı mesajı göster
	if (isEmpty) {
		alert("Bazı satırları boş bıraktınız!");
		return;
	}
}

// İki formdaki girişleri birleştirerek mergedForm'a dönüştürür ve sunucuya gönderir.
function mergeForms() {
	// addProduct formundaki inputları alır
	var form1Inputs = document
		.getElementById("addProduct")
		.getElementsByTagName("input");

	// addPrice formundaki inputları alır
	var form2Inputs = document
		.getElementById("addPrice")
		.getElementsByTagName("input");

	// addProduct formundaki select'i alır
	var form1Select = document
		.getElementById("addProduct")
		.getElementsByTagName("select")[0];

	// addPrice formundaki select'i alır
	var form2Select = document
		.getElementById("addPrice")
		.getElementsByTagName("select")[0];

	// addProduct formundaki textarea'yı alır
	var form1Textarea = document
		.getElementById("addProduct")
		.getElementsByTagName("textarea")[0];

	// mergedForm elementini alır
	var mergedForm = document.getElementById("mergedForm");

	// addProduct formundaki inputları gizli girişlere dönüştürerek mergedForm'a ekler
	for (var i = 0; i < form1Inputs.length; i++) {
		var input = document.createElement("input");
		input.type = "hidden";
		input.name = form1Inputs[i].name;
		input.value = form1Inputs[i].value;
		mergedForm.appendChild(input);
	}

	// addPrice formundaki inputları gizli girişlere dönüştürerek mergedForm'a ekler
	for (var i = 0; i < form2Inputs.length; i++) {
		var input = document.createElement("input");
		input.type = "hidden";
		input.name = form2Inputs[i].name;
		input.value = form2Inputs[i].value;
		mergedForm.appendChild(input);
	}

	// addProduct formundaki select'i gizli girişe dönüştürerek mergedForm'a ekler
	var select1 = document.createElement("input");
	select1.type = "hidden";
	select1.name = form1Select.name;
	select1.value = form1Select.value;
	mergedForm.appendChild(select1);

	// addPrice formundaki select'i gizli girişe dönüştürerek mergedForm'a ekler
	var select2 = document.createElement("input");
	select2.type = "hidden";
	select2.name = form2Select.name;
	select2.value = form2Select.value;
	mergedForm.appendChild(select2);

	// addProduct formundaki textarea'yı mergedForm'a ekler
	var textarea1 = document.createElement("textarea");
	textarea1.name = form1Textarea.name;
	textarea1.value = form1Textarea.value;
	mergedForm.appendChild(textarea1);

	// mergedForm'u sunucuya gönderir
	mergedForm.submit();
}
