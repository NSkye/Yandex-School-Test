/*ЗАДАНИЕ*/
let MyForm = {
	validate: function () {
		let 	isValid 	  = true, 
				errorFields   = [];
		const 	Data 		  = this.getData(),
				fio 		  = Data.fio, 
				phone 		  = Data.phone, 
				email 		  = Data.email,
				/*ВАЛИДАЦИЯ ФИО*/
				checkFio	  = / *(([А-я]+([\'\’\-‎]?[А-я]+)*)+ +){2}(([А-я]+([\'\’\-‎]?[А-я]+)*)+ *)/
				notValidFio	  = !fio.match(checkFio) || fio!==fio.match(checkFio)[0],
				/*ВАЛИДАЦИЯ ПОЧТЫ*/
				checkEmail 	  = /[A-z]+\d*([\.\-]?[A-z\d]+)*@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)/,
				notValidEmail = !email.match(checkEmail) || email!==email.match(checkEmail)[0] || (email.split('@')[0].length>30),
				/*ВАДИДАЦИЯ ТЕЛЕФОНА*/
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



/*ДОПОЛНИТЕЛЬНО*/
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