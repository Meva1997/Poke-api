const listaPokemon = document.querySelector('#listaPokemon'); 
const btnHeader = document.querySelectorAll('.btn-header');
const searchBtn = document.querySelector('#search-button');
const pokemonSearchInput = document.querySelector('#pokemon-search'); 

let pokemonList = []; // <- aquí se almacenarán los Pokémon cargados por página
let currentPage = 1; //pagina actual 
let pokemonPerPage = 21; //pokemones por pagina 
let pokemonFiltrados = [];
let enModoFiltrado = false;


async function cargarTodosLosPokemon(){
    const totalPokemon = 151;
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${totalPokemon}`;

    mostrarLoader();

    try {
        const response = await axios.get(url); 
        const pokemonData = response.data.results;
        pokemonList = [];

        for(let i = 0; i < pokemonData.length; i++){
            const pokemon = await axios.get(pokemonData[i].url);
            pokemonList.push(pokemon.data);
        }

        mostrarPokemonPorPagina(currentPage);
        mostrarBotonesPaginacion();
    } catch (error) {
        console.error("Error cargando Pokémon:", error);
    } finally {
        ocultarLoader();
    }
}

function mostrarPokemonPorPagina(page){
    limpiarHTML();
    mostrarLoader();

    const listaActual = enModoFiltrado ? pokemonFiltrados : pokemonList;

    if (listaActual.length === 0) {
        ocultarLoader();
        ocultarBotonesPaginacion(); 
        return;
    }

    const inicio = (page - 1) * pokemonPerPage;
    const fin = inicio + pokemonPerPage;
    const paginaPokemon = listaActual.slice(inicio, fin);

    setTimeout(() => {
        paginaPokemon.forEach(poke => mostrarPokemon(poke));
        ocultarLoader();
    }, 300);
}



function mostrarBotonesPaginacion(){
    const paginationContainer = document.querySelector('#pagination'); 

    //limpiar botones anteriores
    paginationContainer.innerHTML = ''; 

    const listaActual = enModoFiltrado ? pokemonFiltrados : pokemonList;
    const totalPages = Math.ceil(listaActual.length / pokemonPerPage);

     // 👉 Ocultar el contenedor si no hay páginas
    if (totalPages <= 1 || listaActual.length === 0) {
        paginationContainer.classList.add('hidden');
        ocultarBotonesPaginacion()
        return;
    } else {
        paginationContainer.classList.remove('hidden');
    }

    //boton "anterior"
    if(currentPage > 1){
        const previousButton = document.createElement('button'); 
        previousButton.textContent = 'Anterior'; 
        previousButton.classList.add('btn-anterior')
        previousButton.addEventListener('click', () => {
            currentPage--;
            mostrarPokemonPorPagina(currentPage); 
            mostrarBotonesPaginacion()

            // Desplazar la página hacia arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(previousButton)
    }

    //boton siguiente 
    if(currentPage < totalPages){
        const nextButton = document.createElement('button'); 
        nextButton.textContent = 'Siguiente'; 
        nextButton.classList.add('btn-siguiente'); 
        nextButton.addEventListener('click', () => {
            currentPage++; 
            mostrarPokemonPorPagina(currentPage);
            mostrarBotonesPaginacion();

            // Desplazar la página hacia arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(nextButton); 
    }
}

//mostrar un pokemon
function mostrarPokemon(poke){

    let tipos = poke.types.map((type)=> `<p class="${type.type.name} tipo">${type.type.name}</p>`).join(''); 

    let pokeId = poke.id.toString().padStart(3, '0'); //formatear id con ceros

    const div = document.createElement('DIV'); 
    div.classList.add('pokemon'); 
    div.innerHTML = `
        <p class="pokemon-id-back">#${pokeId}</p>
            <div class="pokemon-imagen">
                <img src="${poke.sprites.front_default}" alt="${poke.name}">
            </div>
            <div class="pokemon-info">
                <div class="nombre-contenedor">
                    <p class="pokemon-id">#${pokeId}</p>
                    <h3 class="pokemon-nombre">${poke.name}</h3>
                </div>
                <div class="pokemon-tipos">
                    ${tipos}
                </div>
                <div class="pokemon-stats">
                    <p class="stat">${poke.height / 10}m</p>
                    <p class="stat">${poke.weight / 10}kg</p>
                </div>
            </div>
    `;


    listaPokemon.appendChild(div); 
}

// Filtrar Pokémon por tipo
function filtrarPokemon(tipo) {
    currentPage = 1;
    if (tipo === 'ver-todos') {
        enModoFiltrado = false;
        pokemonSearchInput.value = ''; // limpiar input de búsqueda
        ocultarMensajeError();
        mostrarPokemonPorPagina(currentPage);
        mostrarBotonesPaginacion();
        return;
    }
    
    enModoFiltrado = true;
    pokemonFiltrados = pokemonList.filter(poke => poke.types.some(t => t.type.name === tipo));
    

    limpiarHTML();
    ocultarMensajeError();

    if(pokemonFiltrados.length === 0){
        mostrarMensajeError(`No se encontraron Pokémon del tipo "${tipo}"`);
        ocultarBotonesPaginacion()
        return;
    }

    mostrarPokemonPorPagina(currentPage);
    mostrarBotonesPaginacion();
}



function limpiarHTML(){
    while(listaPokemon.firstChild){
        listaPokemon.removeChild(listaPokemon.firstChild); 
    }
}

//buscar pokemon por nombre 
function buscarPokemon(nombre){
    currentPage = 1;
    enModoFiltrado = true;
    pokemonFiltrados = pokemonList.filter(poke =>
        poke.name.toLowerCase().includes(nombre.toLowerCase())
    );

    if(pokemonFiltrados.length === 0){
        limpiarHTML();
        ocultarLoader();
        mostrarMensajeError(`No se encontró ningún Pokémon con el nombre "${nombre}"`);
        ocultarBotonesPaginacion()
        return;
    }

    ocultarMensajeError();
    mostrarPokemonPorPagina(currentPage);
    mostrarBotonesPaginacion();
}



// Agregar eventos a los botones
btnHeader.forEach((boton) => {
    boton.addEventListener('click', (event) => {
        const botonId = event.currentTarget.id;
        filtrarPokemon(botonId);
    });
});

searchBtn.addEventListener('click', () => {
    const pokemonNombre = pokemonSearchInput.value.trim(); 
    if(pokemonNombre){
        buscarPokemon(pokemonNombre); 
        pokemonSearchInput.value = '';  //limpiar input despues de buscar 
    } else {
        // Mostrar todos los Pokémon sin filtros ni búsqueda
        currentPage = 1;
        enModoFiltrado = false;
        mostrarPokemonPorPagina(currentPage);
        mostrarBotonesPaginacion();
        ocultarMensajeError(); 
    }
});


pokemonSearchInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter'){
        const nombre = pokemonSearchInput.value.trim();
        if(nombre){
            buscarPokemon(nombre); 
            pokemonSearchInput.value = ''; 
        } else {
            // Si el campo está vacío, mostrar todos los Pokémon
            currentPage = 1;
            enModoFiltrado = false;
            mostrarPokemonPorPagina(currentPage);
            mostrarBotonesPaginacion();
        }
    }
})

function mostrarLoader() {
    document.querySelector('#loader').classList.remove('hidden');
}

function ocultarLoader() {
    document.querySelector('#loader').classList.add('hidden');
}

function mostrarMensajeError(mensaje) {
    const mensajeError = document.querySelector('#mensaje-error');
    mensajeError.textContent = mensaje;
    mensajeError.classList.remove('hidden');
}

function ocultarMensajeError() {
    const mensajeError = document.querySelector('#mensaje-error');
    mensajeError.classList.add('hidden');
}

// Función para ocultar los botones de paginación
function ocultarBotonesPaginacion(){
    const paginationContainer = document.querySelector('#pagination');
    paginationContainer.innerHTML = ''; // elimina los botones
    paginationContainer.classList.add('hidden');
}



document.addEventListener('DOMContentLoaded', () => {
    cargarTodosLosPokemon(); 
    
})


