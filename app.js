const listaPokemon = document.querySelector('#listaPokemon'); 
const btnHeader = document.querySelectorAll('.btn-header');

let url = 'https://pokeapi.co/api/v2/pokemon/'; 

let pokemonList = []; 

async function cargarPokemon(){
    
    for (let i = 1; i <= 151; i++){
        const response = await fetch(url + i)
        const pokemon = await response.json(); 
        pokemonList.push(pokemon)//guardar los pokemon en el array 
        mostrarPokemon(pokemon)  // mostrar todos inicialmente
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


// Agregar eventos a los botones
btnHeader.forEach((boton) => {
    boton.addEventListener('click', (event) => {
        const botonId = event.currentTarget.id;
        filtrarPokemon(botonId);
    });
});

cargarPokemon(); 