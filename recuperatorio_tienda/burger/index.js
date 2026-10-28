

const productosJSON = `[
  { "id": 1, "nombre": "Cheeseburger", "descripcion": "Medallón de carne, cheddar, pepinos y ketchup", "categoria": "Clásicas", "precio": 7500, "stock": 10, "imagen": "img/1.jpg" },
  { "id": 2, "nombre": "Clásica Completa", "descripcion": "Carne, lechuga, tomate y cebolla", "categoria": "Clásicas", "precio": 8200, "stock": 8, "imagen": "img/2.jpg" },
  { "id": 3, "nombre": "Cuarto de Libra", "descripcion": "Carne de 200 g, cheddar, cebolla y tomate", "categoria": "Clásicas", "precio": 9900, "stock": 0, "imagen": "img/3.jpg" },
  { "id": 4, "nombre": "Bacon BBQ", "descripcion": "Carne, panceta crocante, cheddar y salsa barbacoa", "categoria": "Especiales", "precio": 12500, "stock": 5, "imagen": "img/4.jpg" },
  { "id": 5, "nombre": "Provoleta", "descripcion": "Carne, provoleta fundida y cebolla caramelizada", "categoria": "Especiales", "precio": 13200, "stock": 4, "imagen": "img/5.jpg" },
  { "id": 6, "nombre": "Doble Cheddar", "descripcion": "Doble carne, doble cheddar, cebolla y lechuga", "categoria": "Especiales", "precio": 14000, "stock": 3, "imagen": "img/6.jpg" },
  { "id": 7, "nombre": "Combo Clásico", "descripcion": "Hamburguesa completa con papas fritas", "categoria": "Combos", "precio": 15900, "stock": 6, "imagen": "img/7.jpg" },
  { "id": 8, "nombre": "Combo Crispy", "descripcion": "Pollo crispy, coleslaw y papas fritas", "categoria": "Combos", "precio": 16500, "stock": 2, "imagen": "img/8.jpg" },
  { "id": 9, "nombre": "Combo Onion", "descripcion": "Carne, aros de cebolla, cheddar y papas fritas", "categoria": "Combos", "precio": 17800, "stock": 1, "imagen": "img/9.jpg" }
]`;



const tituloBurger = document.getElementById("titulo-burger");
const productsContainer = document.getElementById("products-container");
const buscador = document.getElementById("buscador");
const selectOrden = document.getElementById("orden");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const botonVaciar = document.getElementById("vaciar-carrito");



const productos = JSON.parse(productosJSON);

localStorage.setItem("productos", JSON.stringify(productos));

function obtenerProductos() {
    return JSON.parse(localStorage.getItem("productos"));
}

console.table(obtenerProductos());

function formatearPrecio(valor) {
    return `$ ${valor.toLocaleString("es-AR")}`;
}


function renderizarProductos(lista) {

   
    productsContainer.innerHTML = "";

  
    if (lista.length === 0) {
        productsContainer.innerHTML = `<p class="sin-resultados">No se encontraron productos</p>`;
        return;
    }

    lista.forEach(producto => {

        
        const card = document.createElement("div");
        card.classList.add("card-producto");

        const sinStock = producto.stock === 0;

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="descripcion">${producto.descripcion}</p>
            <p class="precio">${formatearPrecio(producto.precio)}</p>
            <button ${sinStock ? "disabled" : ""}>${sinStock ? "Sin stock" : "Agregar al carrito"}</button>
        `;

        card.querySelector("button").addEventListener("click", () => agregarAlCarrito(producto.id));

        productsContainer.appendChild(card);
    });
}


tituloBurger.addEventListener("click", aplicarFiltros);


function aplicarFiltros() {

    
    let lista = [...obtenerProductos()];


    const categoria = document.querySelector('input[name="categoria"]:checked').value;
    if (categoria !== "Todas") {
        lista = lista.filter(producto => producto.categoria === categoria);
    }

    const texto = buscador.value.toLowerCase();
    lista = lista.filter(producto =>
        producto.nombre.toLowerCase().includes(texto) ||
        producto.descripcion.toLowerCase().includes(texto)
    );

    const orden = selectOrden.value;
    if (orden === "menor") {
        lista.sort((a, b) => a.precio - b.precio);
    } else if (orden === "mayor") {
        lista.sort((a, b) => b.precio - a.precio);
    }

    renderizarProductos(lista);
}


buscador.addEventListener("keyup", aplicarFiltros);

selectOrden.addEventListener("change", aplicarFiltros);


document.querySelectorAll('input[name="categoria"]').forEach(radio => {
    radio.addEventListener("change", aplicarFiltros);
});


let carrito = [];

function cargarCarrito() {
    const guardado = localStorage.getItem("carrito");
    carrito = guardado ? JSON.parse(guardado) : [];
}

function agregarAlCarrito(id) {

    const producto = obtenerProductos().find(p => p.id === id);

    // ¿Ya está en el carrito?
    const existente = carrito.find(item => item.id === id);

    if (existente) {
        if (existente.cantidad >= producto.stock) {
            alert("No hay más stock disponible");
            return;
        }
        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }

    actualizarCarrito();
}


function quitarDelCarrito(id) {
    const item = carrito.find(i => i.id === id);
    item.cantidad--;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    }

    actualizarCarrito();
}


botonVaciar.addEventListener("click", () => {
    carrito = [];
    actualizarCarrito();
});


function actualizarCarrito() {


    localStorage.setItem("carrito", JSON.stringify(carrito));

    cartList.innerHTML = "";

    if (carrito.length === 0) {
        cartList.innerHTML = `<li class="carrito-vacio">Tu carrito está vacío</li>`;
    }

    carrito.forEach(item => {
        const li = document.createElement("li");

        li.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>${formatearPrecio(item.precio * item.cantidad)}</span>
            <button>Quitar</button>
        `;

        li.querySelector("button").addEventListener("click", () => quitarDelCarrito(item.id));

        cartList.appendChild(li);
    });

    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    cartTotal.textContent = formatearPrecio(total);

    const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    cartCount.textContent = `Carrito (${cantidadTotal})`;
}



function init() {
    cargarCarrito();        
    actualizarCarrito();    
}

init();
