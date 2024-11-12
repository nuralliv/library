const movieAPI = 'https://54d749da1e7f46ac.mokky.dev/movies';
const currentUserId = localStorage.getItem('userId');
const movieList = document.getElementById('movieList');
const userNameDisplay = document.getElementById('userName');
const logoutButton = document.getElementById('logoutButton');

// Проверка авторизации
if (!currentUserId) {
   window.location.href = '../log/index.html';
} else {
   userNameDisplay.textContent = localStorage.getItem('userName');
}

// Логаут
logoutButton.addEventListener('click', () => {
   localStorage.removeItem('userId');
   localStorage.removeItem('userName');
   window.location.href = '../log/';
});

// Получение фильмов для текущего пользователя
async function fetchMovies() {
   try {
      const response = await fetch(`${movieAPI}?userId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      const movies = await response.json();
      displayMovies(movies);
   } catch (error) {
      console.error('Error fetching movies:', error);
   }
}

// Отображение фильмов
function displayMovies(movies) {
   const selectedGenre = document.getElementById('filterGenre').value;
   const selectedRating = parseInt(document.getElementById('filterRating').value, 10);
   const showWatchedOnly = document.getElementById('showWatched').innerText === 'Show All';

   movieList.innerHTML = '';

   movies
      .filter(movie => !selectedGenre || movie.genre === selectedGenre)
      .filter(movie => !selectedRating || movie.rating === selectedRating)
      .filter(movie => !showWatchedOnly || movie.watched)
      .forEach(movie => {
         const movieCard = document.createElement('div');
         movieCard.className = `movie-card ${movie.watched ? 'watched' : 'unwatched'}`;
         movieCard.innerHTML = `
            <h3>${movie.title}</h3>
                        ${movie.imageUrl ? `<img src="${movie.imageUrl}" alt="${movie.title} image" class="movie-image"/>` : ''}

            <p>Genre: ${movie.genre}</p>
            <p id='stars'> ${'★'.repeat(movie.rating)}</p>
            <button class="watched-btn" onclick="toggleWatched('${movie.id}', ${movie.watched})">${movie.watched ? 'Watched' : 'Not watched'}</button>
            <button class="delete-btn" onclick="deleteMovie('${movie.id}')">Delete</button>
         `;
         movieList.appendChild(movieCard);
      });
}

// Добавление нового фильма
// Добавление нового фильма
document.getElementById('addMovie').addEventListener('click', async () => {
   const title = document.getElementById('movieTitle').value;
   const genre = document.getElementById('movieGenre').value;
   const rating = parseInt(document.getElementById('movieRating').value, 10);
   const imageFile = document.getElementById('movieImage').files[0];
   const watched = document.getElementById('movieWatched').checked; // считываем значение checkbox
   let imageUrl = '';

   // Проверка на валидность
   if (!title || !genre || isNaN(rating) || rating < 1 || rating > 5 || !imageFile) {
      alert('Please fill in all fields with valid data');
      return;
   }

   if (imageFile) {
      const reader = new FileReader();
      reader.onload = async function (event) {
         imageUrl = event.target.result;
         await createMovie({ title, genre, rating, watched, userId: currentUserId, imageUrl });
      };
      reader.readAsDataURL(imageFile);
   } else {
      await createMovie({ title, genre, rating, watched, userId: currentUserId });
   }
});


async function createMovie(newMovie) {
   try {
      const response = await fetch(movieAPI, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(newMovie)
      });
      if (!response.ok) throw new Error('Failed to add movie');
      fetchMovies();
   } catch (error) {
      console.error('Error adding movie:', error);
   }
}

async function toggleWatched(movieId, currentStatus) {
   try {
      await fetch(`${movieAPI}/${movieId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ watched: !currentStatus })
      });
      fetchMovies();
   } catch (error) {
      console.error('Error updating movie status:', error);
   }
}


// Удаление фильма
async function deleteMovie(movieId) {
   try {
      await fetch(`${movieAPI}/${movieId}`, { method: 'DELETE' });
      fetchMovies();
   } catch (error) {
      console.error('Error deleting movie:', error);
   }
}


// Фильтры и кнопка "Show Watched"
document.getElementById('filterGenre').addEventListener('change', fetchMovies);
document.getElementById('filterRating').addEventListener('change', fetchMovies);
document.getElementById('showWatched').addEventListener('click', () => {
   const showWatched = document.getElementById('showWatched').innerText === 'Show Watched';
   document.getElementById('showWatched').innerText = showWatched ? 'Show All' : 'Show Watched';
   fetchMovies();
});

// Загрузка фильмов при загрузке страницы
fetchMovies();

