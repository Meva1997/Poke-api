const listaPokemon = document.querySelector('#listaPokemon'); 
const btnHeader = document.querySelectorAll('.btn-header');
const searchBtn = document.querySelector('#search-button');
const pokemonSearchInput = document.querySelector('#pokemon-search'); 

let url = 'https://pokeapi.co/api/v2/pokemon/'; 

let pokemonList = []; 

async function cargarPokemon(){
    
    for (let i = 1; i <= 151; i++){
        try {
            const response = await axios.get(url + i); 
            const pokemon = response.data; //accedemos directamente a los datos con Axios 
            pokemonList.push(pokemon)//guardar los pokemon en el array 
            mostrarPokemon(pokemon)  // mostrar todos inicialmente
        } catch(error){
            console.error(`Error fetching Pokémon with ID ${i}:`, error); 
        }
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
    `


    listaPokemon.appendChild(div); 
}

// Filtrar Pokémon por tipo
function filtrarPokemon(tipo) {
    limpiarHTML();

    if (tipo === 'ver-todos') {
        pokemonList.forEach((poke) => mostrarPokemon(poke));
    } else {
        const filtrados = pokemonList.filter((poke) =>
            poke.types.some((t) => t.type.name === tipo)
        );
        filtrados.forEach((poke) => mostrarPokemon(poke));
    }
}

function limpiarHTML(){
    while(listaPokemon.firstChild){
        listaPokemon.removeChild(listaPokemon.firstChild); 
    }
}

//buscar pokemon por nombre 
function buscarPokemon(nombre){
    limpiarHTML();
    
    const pokemonBuscado = pokemonList.filter((poke) => 
    poke.name.toLowerCase().includes(nombre.toLowerCase())
    ); 

    pokemonBuscado.forEach((poke) => mostrarPokemon(poke)); 
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
         // Si el campo está vacío, mostrar todos los Pokémon
        limpiarHTML();
        pokemonList.forEach((poke) => mostrarPokemon(poke));
    }
})

pokemonSearchInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter'){
        const pokemonNombre = pokemonSearchInput.value.trim();
        if(pokemonNombre){
            buscarPokemon(pokemonNombre); 
            pokemonSearchInput.value = ''; 
        } else {
             // Si el campo está vacío, mostrar todos los Pokémon
            limpiarHTML(); 
            pokemonList.forEach((poke) => mostrarPokemon(poke));
        }   
    }
})

document.addEventListener('DOMContentLoaded', () => {
    cargarPokemon(); 
    
})