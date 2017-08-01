let MyForm = {
	validate: function () {
		let 	isValid 	  = true, 
				errorFields   = [];
		const 	Data 		  = this.getData(),
				fio 		  = Data.fio, 
				phone 		  = Data.phone, 
				email 		  = Data.email,
				/*
				В задании требовалось создать поле для ввода ФИО. Имена такого формата встречаются преимущественно на территории СНГ,
				в связи с этим, а так же с тем, что подобные формы как правило предполагают запись имени с помощью символов
				алфавита какого-то конкретного языка и что имена никогда не записываются символами из разных алфавитов, разработка велась
				исходя из предположения, что ФИО должно быть записано с помощью букв русского алфавита.
				
				Подтверждение ФИО происходит по следующим правилам:
				1. Ровно три слова
				2. Каждое слово может содержать в себе буквы русского алфавита, а так же символы апострофа (' или ’‎) и дефиса (-)
				3. Слово не может начинаться с апострофа или дефиса
				4. Слово не может заканчиваться апострофом или дефисом
				5. Символы, не являющиеся буквами (апострофы и дефисы), не могут идти подряд
				6. Вокруг слов может быть произвольное количество пробелов

				Ограничений на количество букв не накладывалось. В теории слово, в том числе и Имя/Фамилия/Отчество может состоять из одной буквы.

				Примеры:
				Иванов Иван Иванович, Иванов-Петров Иван Иванович, Д’Артаньян Иван Иванович — пройдут валидацию;‎
				Иванов--Петров Иван Иванович, --Иванов-- Иван Иванович, ' ' ', - - -, Иванов Иван — не пройдут валидацию.
				*/
				checkFio	  = / *(([А-я]+(\-?[А-я]+)*([\'\’‎]?[А-я]+)*)+ +){2}(([А-я]+(\-?[А-я]+)*([\'\’‎]?[А-я]+))+ *)/
				notValidFio	  = !fio.match(checkFio) || fio!==fio.match(checkFio)[0],
				/*
				Подтверждение Email происходит по следующим правилам:
				1. Может содержать в себе буквы латинского алфавита, цифры и символы точки (.) и дефиса (-)
				2. Не может начинаться с точки или дефиса
				3. Не может начинаться с цифры
				4. Не может заканчиваться точкой или дефисом
				5. Символы, не являющиеся буквами (точки и дефисы), не могут идти подряд
				6. Оканчиваться может только на @ya.ru, @yandex.ru, @yandex.ua, @yandex.by, @yandex.kz или @yandex.com
				7. Максимальное количество символов до @ — 30

				Правила составлены исходя из соответствующих ограничений в сервисах Яндекс

				Примеры:
				ya@ya.ru, henry-ford@yandex.by, henry.ford@yandex.kz, henryford63@yandex.ua, henry-fordhenry-fordhenry-ford@yandex.ru — пройдут валидацию;
				ya.ru, @ya.ru, henry---ford@yandex.by, .henry.ford@yandex.kz, 63henryford@yandex.ua, henry.-ford@ya.ru, henry-fordhenry-fordhenry-ford1@yandex.ru — не пройдут валидацию.
				*/
				checkEmail 	  = /[A-z]+\d*([\.\-]?[A-z]+)*@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)/,
				notValidEmail = !email.match(checkEmail) || email!==email.match(checkEmail)[0] || (email.split('@')[0].length>30),
				/*
				Подтверждение телефона происходит по следующим правилам:
				1. Должен соответствовать шаблону +7(XXX)XXX-XX-XX
				2. Сумма всех цифр не может превышать 30
				*/
				checkPhone	  = /\+7\(\d{3}\)\d{3}\-\d{2}\-\d{2}/,
				notValidPhone = !phone.match(checkPhone) || phone!==phone.match(checkPhone)[0] || (phone.replace(/[\+\(\)\-]/g, "")
																										.split("")
																										.reduce((a,b)=>Number(a)+Number(b)))
																										 >30;
		if (notValidFio)
			{isValid=false; errorFields.push("fio");}

		if (notValidEmail)
			{isValid=false; errorFields.push("email");}

		if (notValidPhone)
			{isValid=false; errorFields.push("phone");}

		return {isValid, errorFields};
	},

	getData: function() {
		const 	coreForm 	= document.getElementById("myForm"),
				fio 		= coreForm.fio.value, 
				email 		= coreForm.email.value,
				phone 		= coreForm.phone.value;
		
		return {fio, email, phone};
	},

	setData: function(values) {
		let coreForm 			= document.getElementById("myForm");
		coreForm.fio.value 		= values.fio;
		coreForm.email.value 	= values.email;
		coreForm.phone.value 	= values.phone;
	},

	submit: function() {
		let currentErrorFields = document.getElementsByClassName('error'), j = 0;

		while (currentErrorFields[j])
			currentErrorFields[j].classList.remove('error');
		

		if (!this.validate().isValid) {
			const   errorFields	= this.validate().errorFields;
					coreForm	= document.getElementById("myForm");

			let i = errorFields.length-1;
			while (errorFields[i]) {
				coreForm[errorFields[i]].classList.add("error");
				i--;
			}
		}
		else {
			let  reqAddress  = () => document.getElementById("myForm").getAttribute("action"),
				  reqMethod  = document.getElementById("myForm").getAttribute("method"),
				  RC 		 = document.getElementById("resultContainer");
			let   response 	 = {};
			document.getElementById("submitButton").setAttribute("disabled", "disabled");

			let req = new XMLHttpRequest();

			let responseHandler = function(req) {
					response   	 = JSON.parse(req.responseText);
					RC.className = "";

				console.log("Loaded:", req.responseText);

				if (response.status==="progress") {
					let tmt = response.timeout, 
					counter = response.timeout;

					RC.classList.add("progress");

					let timer = setInterval(()=> {
						if (counter<=0)
							clearInterval();
						counter-=200;
						RC.textContent = "Progress. Retrying in "+Math.floor(counter/1000)+"s...";
					}, 200);

					setTimeout(()=> {
						clearInterval(timer);
						req.open(reqMethod, reqAddress(), true)
						req.send(null);
					}, tmt);

				}
				else if (response.status==="success") {
					RC.classList.add("success");
					RC.textContent = "Success";
				}
				else if (response.status==="error") {
					RC.classList.add("error");
					RC.textContent = "Error has occured. Reason: "+response.reason;
				}
				else {
					RC.classList.add("error");
					RC.textContent = "Response status is not correct";
				}

			}

			req.addEventListener("load", () => {
					if (req.status<400)
						responseHandler(req);
					else {
						RC.className = "";
						RC.classList.add("error");
						RC.textContent = "Error has occured. Code: "+req.status;
					}
				});


			req.open(reqMethod, reqAddress(), true);
			req.send(null);
		}
	}
}

var submit = document.getElementById("submitButton");
submit.addEventListener("click", () => {
	MyForm.submit();
}, false);









/*controlContainer*/
let successButton 	  = document.getElementById("successBtn"),
 	errorButton 	  = document.getElementById("errorBtn"),
 	progressButton 	  = document.getElementById("progressBtn"),
 	coreForm 		  = document.getElementById("myForm"),
 	setDataButton 	  = document.getElementById("setDataButton"),
 	removeActiveState = function () {
		let activeButtons = document.getElementsByClassName("buttonContainer__button--active"),
		 	i 			  = activeButtons.length-1;
		while(activeButtons[i]) {
			activeButtons[i].classList.remove("buttonContainer__button--active");
		}
	},
	applyState = function (state) {
		if (state === "success") {
			removeActiveState();
			successButton.classList.add("buttonContainer__button--active");
			coreForm.setAttribute("action", "ajax/success.json");
		} else if (state === "error") {
			removeActiveState();
			errorButton.classList.add("buttonContainer__button--active");
			coreForm.setAttribute("action", "ajax/error.json");
		} else if (state === "progress") {
			removeActiveState();
			progressButton.classList.add("buttonContainer__button--active");
			coreForm.setAttribute("action", "ajax/progress.json");
		}
	};

successButton.addEventListener("click", ()=>{applyState("success");}, false)
errorButton.addEventListener("click", ()=>{applyState("error");}, false)
progressButton.addEventListener("click", ()=>{applyState("progress");}, false)
setDataButton.addEventListener("click", function(){
	const 	setDataForm 	= document.getElementById("setData"),
			fio 			= setDataForm.fio.value, 
			email 			= setDataForm.email.value,
			phone 			= setDataForm.phone.value;
	MyForm.setData({fio, email, phone});
}, false)