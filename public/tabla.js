// tabla.js
// para que no se ejecute hasta que la página esté totalmente cargada

window.onload = async () => {
    console.log("La página está totalmente cargada");

    const res = await fetch('http://localhost:3000/api/facturas/')
	const data = await res.json()
	const facturas = data.data
	dayjs.extend(window.dayjs_plugin_customParseFormat);
	const tbody = document.querySelector('tbody')
				
	let tbodyHtml = ''
	facturas.forEach(fac => {
		fac.date = fac.date.slice(2,10)
		tbodyHtml += `
			<tr class="row">
			<td class="border border-slate-300 px-2 py-2">${fac.id}</td>
			<td class="border border-slate-300 px-2 py-2">
				<input type="text" value="${fac.client}" name="client" data-id="${fac.id}">
			</td>
			<td class="border border-slate-300 px-2 py-2">
				<input type="date" value="${dayjs(fac.date, "YY-MM-DD").format('YYYY-MM-DD')}" name="date" data-id="${fac.id}">
			</td>
			<td class="border border-slate-300 px-2 py-2">
				<input type="text" value="${fac.concept}" name="concept" data-id="${fac.id}">
			</td>
			<td class="border border-slate-300 px-2 py-2">
				<input type="number" value="${fac.cuantity}" name="cuantity" data-id="${fac.id}">
			</td>
			<td class="border border-slate-300 px-2 py-2">
				<input type="number" value="${fac.price}" name="price" data-id="${fac.id}">
			</td>
			<td class="border border-slate-300 px-2 py-2">
				<input type="number" value="${fac.total}" name="total" data-id="${fac.id}">
			</td>
			</tr>
		`
	});
	// actualizo la tabla
	tbody.innerHTML = tbodyHtml

	// https://javascript.info/bubbling-and-capturing
	const table = document.getElementById('table')
	// Cuando hya un cambio en los inputs
	table.addEventListener('change', (evt) => {
			console.log(evt)
			let value = evt.target.value
			const name  = evt.target.name
			const id    = evt.target.dataset.id
			console.log(`Cambios en ${id} ${name} ${value}`)

			// Aquí el código de cambiar la BD y 
			// de dar un aviso al usuario
			const apiUrl = `http://localhost:3000/api/facturas/${id}`;

			const numeros = ["id", "cuantity", "price", "total"];
			if (numeros.includes(name)) value = parseFloat(value)
			if( name == "date") value = new Date(`${value}T00:00:00.000Z`)

			const data = {
				[name]: value
			};

			const requestOptions = {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			};

			fetch(apiUrl, requestOptions)
				.then(response => {
					if (!response.ok) {
						alert("Ha ocurrido un error inesperado.")
					}
					return response.json();
					
				})
				.then(data => {
					console.log("correcto")
					document.getElementById('alertMessage').style.display = 'block';
					setInterval(function(){ document.getElementById('alertMessage').style.display = 'none' }, 3000);
				})
				.catch(error => {
					console.error
					alert(`Ha ocurrido un error inesperado. ${error}`)
			});
	})
};

