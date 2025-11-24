// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. VARIABLES DE ESTADO ---
  let currentPlayers = [...playersData]; // Copia de los datos para filtrar
  let currentPage = 1;
  let rowsPerPage = 5;
  let sortDirection = {}; // Para saber si ordenamos asc o desc
  let searchHistory = []; // Para guardar los "chips" de búsqueda

  // --- 2. SELECTORES DEL DOM ---
  // Tabla y Paginación
  const tableBody = document.getElementById('players-table-body');
  const rowsPerPageSelect = document.getElementById('rows-per-page');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const currentPageSpan = document.getElementById('current-page');

  // Tarjetas de Estadísticas (Cards)
  const totalPlayersEl = document.getElementById('total-players');
  const totalFavsEl = document.getElementById('total-favs');
  const avgGoalsEl = document.getElementById('avg-goals');
  const totalGoalsEl = document.getElementById('total-goals');
  const avgAgeEl = document.getElementById('avg-age');
  const totalAssistsEl = document.getElementById('total-assists');
  const topScorerEl = document.getElementById('top-scorer-name');

  // Buscador e Historial
  const searchInput = document.getElementById('search-input');
  const searchClearIcon = document.getElementById('search-clear');
  const searchBtn = document.getElementById('search-btn'); // Botón Limpiar general
  const historyContainer = document.getElementById('history-container');
  const clearHistoryBtn = document.getElementById('clear-history');

  // Botones de Acción (Pintar filas)
  const btnPaintEven = document.getElementById('btn-paint-even');
  const btnPaintOdd = document.getElementById('btn-paint-odd');
  const btnClearPaint = document.getElementById('btn-clear-paint');

  // Modo Oscuro
  const themeToggleBtn = document.getElementById('theme-toggle');

  // Modal
  const modal = document.getElementById('modal-detail');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCloseX = document.getElementById('modal-close-x');
  // Elementos internos del modal
  const mName = document.getElementById('modal-name');
  const mPos = document.getElementById('modal-position');
  const mClub = document.getElementById('modal-club');
  const mCountry = document.getElementById('modal-country');
  const mAge = document.getElementById('modal-age');
  const mGoals = document.getElementById('modal-goals');
  const mAssists = document.getElementById('modal-assists');
  const mRating = document.getElementById('modal-rating');
  const mFavBtn = document.getElementById('modal-fav-btn');


  // --- 3. FUNCIONES DE LÓGICA ---

  // Inicializar
  function init() {
    renderTable();
    updateStats();
  }

  // Renderizar Tabla
  function renderTable() {
    tableBody.innerHTML = ''; // Limpiar tabla

    // Lógica de Paginación
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPlayers = currentPlayers.slice(startIndex, endIndex);

    paginatedPlayers.forEach(player => {
      const tr = document.createElement('tr');
      
      // Evento: Al hacer click en la fila, abrir Modal
      // (Excluimos el click en la estrella de favorito para que no se abra el modal ahí)
      tr.addEventListener('click', (e) => {
        if(!e.target.classList.contains('fav-icon')) {
          openModal(player);
        }
      });

      // Icono de estrella (Amarilla si es true, gris si false)
      const starClass = player.favorite ? 'fav-icon active' : 'fav-icon';
      const starSymbol = player.favorite ? '★' : '☆';

      tr.innerHTML = `
        <td class="text-center">
          <span class="${starClass}" data-id="${player.id}">${starSymbol}</span>
        </td>
        <td><strong>${player.name}</strong></td>
        <td>${player.club}</td>
        <td>${player.position}</td>
        <td>${player.country}</td>
        <td>${player.age}</td>
        <td>${player.goals}</td>
        <td>${player.assists}</td>
        <td><strong>${player.rating}</strong></td>
      `;

      tableBody.appendChild(tr);
    });

    // Actualizar número de página
    currentPageSpan.textContent = currentPage;
    
    // Agregar eventos a las estrellas generadas
    document.querySelectorAll('.fav-icon').forEach(icon => {
      icon.addEventListener('click', toggleFavorite);
    });
  }

  // Actualizar Estadísticas (Cards)
  function updateStats() {
    // 1. Total Jugadores en tabla
    totalPlayersEl.textContent = currentPlayers.length;

    // 2. Total Favoritos (de toda la data, no solo la filtrada, según lógica usual)
    const favCount = currentPlayers.filter(p => p.favorite).length;
    totalFavsEl.textContent = favCount;

    if (currentPlayers.length === 0) {
      avgGoalsEl.textContent = '0.0';
      totalGoalsEl.textContent = '0';
      avgAgeEl.textContent = '0 años';
      totalAssistsEl.textContent = '0';
      topScorerEl.textContent = '-';
      return;
    }

    // 3. Cálculos matemáticos
    const totalGoals = currentPlayers.reduce((acc, p) => acc + p.goals, 0);
    const totalAge = currentPlayers.reduce((acc, p) => acc + p.age, 0);
    const totalAssists = currentPlayers.reduce((acc, p) => acc + p.assists, 0);

    // 4. Inserción en el DOM
    totalGoalsEl.textContent = totalGoals;
    totalAssistsEl.textContent = totalAssists;
    avgGoalsEl.textContent = (totalGoals / currentPlayers.length).toFixed(1);
    avgAgeEl.textContent = Math.round(totalAge / currentPlayers.length) + ' años';

    // 5. Máximo Goleador
    const topScorer = currentPlayers.reduce((prev, current) => {
      return (prev.goals > current.goals) ? prev : current;
    });
    topScorerEl.textContent = topScorer.name;
  }

  // Toggle Favorito (Estrella)
  function toggleFavorite(e) {
    const id = parseInt(e.target.dataset.id);
    const player = playersData.find(p => p.id === id);
    if (player) {
      player.favorite = !player.favorite; // Invertir valor
      // Re-renderizar todo para que se actualicen contadores
      renderTable();
      updateStats();
    }
  }

  // Filtrar / Buscar
  function handleSearch(term) {
    const lowerTerm = term.toLowerCase();
    
    currentPlayers = playersData.filter(player => 
      player.name.toLowerCase().includes(lowerTerm) || 
      player.club.toLowerCase().includes(lowerTerm)
    );

    currentPage = 1; // Resetear a página 1
    renderTable();
    updateStats();

    // Mostrar u ocultar la "X" del input
    if (term.length > 0) {
      searchClearIcon.classList.remove('hidden');
    } else {
      searchClearIcon.classList.add('hidden');
    }
  }

  // Agregar al Historial (Chips)
  function addToHistory(term) {
    if (!term) return;
    // Evitar duplicados seguidos
    if (searchHistory.includes(term)) return;
    
    // Máximo 5 items
    if (searchHistory.length >= 5) searchHistory.shift();
    
    searchHistory.push(term);
    renderHistory();
  }

  function renderHistory() {
    historyContainer.innerHTML = '';
    searchHistory.forEach(term => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = term;
      chip.addEventListener('click', () => {
        searchInput.value = term;
        handleSearch(term);
      });
      historyContainer.appendChild(chip);
    });
  }

  // Ordenar columnas (Sorting)
  function sortPlayers(column) {
    // Invertir dirección si ya estamos ordenando por esa columna
    if (!sortDirection[column]) sortDirection[column] = 'asc';
    else sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';

    currentPlayers.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      // Si es texto, pasar a minusculas para comparar bien
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection[column] === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection[column] === 'asc' ? 1 : -1;
      return 0;
    });

    renderTable();
  }

  // Pintar Filas
  function paintRows(type) {
    // Primero limpiar
    document.querySelectorAll('.table__body tr').forEach(tr => {
      tr.classList.remove('row-even-highlight', 'row-odd-highlight');
    });

    const rows = document.querySelectorAll('.table__body tr');
    rows.forEach((tr, index) => {
      // index + 1 para pensar en "Fila 1, Fila 2..."
      const position = index + 1;
      if (type === 'even' && position % 2 === 0) {
        tr.classList.add('row-even-highlight');
      } else if (type === 'odd' && position % 2 !== 0) {
        tr.classList.add('row-odd-highlight');
      }
    });
  }

  // --- 4. MANEJO DEL MODAL ---
  function openModal(player) {
    mName.textContent = player.name;
    mPos.textContent = player.position;
    mClub.textContent = player.club;
    mCountry.textContent = player.country;
    mAge.textContent = player.age + ' años';
    mGoals.textContent = player.goals;
    mAssists.textContent = player.assists;
    mRating.textContent = player.rating;

    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }


  // --- 5. EVENT LISTENERS ---

  // Buscador Input (tiempo real)
  searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });

  // Enter en el buscador (para guardar historial)
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addToHistory(searchInput.value);
    }
  });

  // Limpiar input (X)
  searchClearIcon.addEventListener('click', () => {
    searchInput.value = '';
    handleSearch('');
  });

  // Botón "Limpiar" grande
  searchBtn.addEventListener('click', () => {
    searchInput.value = '';
    handleSearch('');
  });

  // Limpiar Historial
  clearHistoryBtn.addEventListener('click', () => {
    searchHistory = [];
    renderHistory();
  });

  // Paginación
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const maxPages = Math.ceil(currentPlayers.length / rowsPerPage);
    if (currentPage < maxPages) {
      currentPage++;
      renderTable();
    }
  });

  rowsPerPageSelect.addEventListener('change', (e) => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
  });

  // Ordenamiento (Delegación de eventos en el header)
  document.querySelectorAll('.table__th[data-column]').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.column;
      if (column !== 'favorite') { // No ordenamos por favorito en este caso simple
        sortPlayers(column);
      }
    });
  });

  // Pintar Filas
  btnPaintEven.addEventListener('click', () => paintRows('even'));
  btnPaintOdd.addEventListener('click', () => paintRows('odd'));
  btnClearPaint.addEventListener('click', () => paintRows('none'));

  // Modo Oscuro
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggleBtn.textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
  });

  // Cerrar Modal
  modalCloseBtn.addEventListener('click', closeModal);
  modalCloseX.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(); // Cerrar si click afuera
  });

  // Inicializar al cargar
  init();
});