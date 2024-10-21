body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    color: #333;
}

header {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    text-align: center;
}

header h1 {
    margin: 0;
}

button {
    margin: 5px;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #45a049;
}

main {
    padding: 20px;
}

section {
    background: white;
    padding: 20px;
    margin: 10px 0;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.hidden {
    display: none;
}

input[type="text"],
input[type="password"],
input[type="file"] {
    width: calc(100% - 22px);
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

h2 {
    margin-top: 0;
}

#musicUl {
    list-style-type: none;
    padding: 0;
}

#musicUl li {
    padding: 10px;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

#musicUl li img {
    width: 50px;
    margin-right: 10px;
}

button i {
    margin-right: 5px;
}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Music Streaming App</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <header>
        <h1>Simple Music Streaming App</h1>
        <div id="authStatus">Not logged in</div>
        <button id="signupBtn">Sign Up</button>
        <button id="loginBtn">Log In</button>
        <button id="logoutBtn" class="hidden">Log Out</button>
    </header>

    <main>
        <section id="signupSection" class="hidden">
            <h2>Sign Up</h2>
            <input type="text" id="signupUsername" placeholder="Username" required>
            <input type="password" id="signupPassword" placeholder="Password" required>
            <button id="submitSignup">Sign Up</button>
        </section>

        <section id="loginSection" class="hidden">
            <h2>Log In</h2>
            <input type="text" id="loginUsername" placeholder="Username" required>
            <input type="password" id="loginPassword" placeholder="Password" required>
            <button id="submitLogin">Log In</button>
        </section>

        <section id="uploadSection" class="hidden">
            <h2>Upload Music</h2>
            <input type="text" id="titleInput" placeholder="Title" required>
            <input type="text" id="artistInput" placeholder="Artist" required>
            <input type="text" id="genreInput" placeholder="Genre" required>
            <input type="file" id="audioInput" accept="audio/*" required>
            <input type="file" id="coverInput" accept="image/*" required>
            <button id="submitUpload">Upload Music</button>
        </section>

        <section id="searchSection" class="hidden">
            <h2>Search Music</h2>
            <input type="text" id="searchQuery" placeholder="Search by title, artist or genre">
            <button id="searchButton">Search</button>
            <ul id="searchResults"></ul>
        </section>

        <section id="musicList" class="hidden">
            <h2>Your Music</h2>
            <ul id="musicUl"></ul>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>
let db;
const request = indexedDB.open('MusicDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Create object stores
    const musicStore = db.createObjectStore('music', { keyPath: 'id', autoIncrement: true });
    musicStore.createIndex('title', 'title', { unique: false });
    musicStore.createIndex('artist', 'artist', { unique: false });
    musicStore.createIndex('genre', 'genre', { unique: false });

    const userStore = db.createObjectStore('users', { keyPath: 'username' });
};

request.onsuccess = function(event) {
    db = event.target.result;
};

// User Authentication
let currentUser = null;

document.getElementById('signupBtn').onclick = function() {
    toggleSections('signupSection');
};

document.getElementById('loginBtn').onclick = function() {
    toggleSections('loginSection');
};

document.getElementById('logoutBtn').onclick = function() {
    currentUser = null;
    updateAuthStatus();
    toggleSections('');
};

document.getElementById('submitSignup').onclick = function() {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    if (username && password) {
        const transaction = db.transaction(['users'], 'readwrite');
        const userStore = transaction.objectStore('users');
        const userData = { username: username, password: password };

        const request = userStore.add(userData);
        request.onsuccess = function() {
            alert('User registered successfully!');
            document.getElementById('signupUsername').value = '';
            document.getElementById('signupPassword').value = '';
        };

        request.onerror = function() {
            alert('Username already exists. Please choose a different one.');
        };
    } else {
        alert('Please fill in both fields.');
    }
};

document.getElementById('submitLogin').onclick = function() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username && password) {
        const transaction = db.transaction(['users'], 'readonly');
        const userStore = transaction.objectStore('users');
        const request = userStore.get(username);

        request.onsuccess = function(event) {
            const user = event.target.result;
            if (user && user.password === password) {
                currentUser = username;
                updateAuthStatus();
                toggleSections('');
                alert('Login successful!');
                loadMusic();
            } else {
                alert('Invalid username or password.');
            }
        };
    } else {
        alert('Please fill in both fields.');
    }
};

document.getElementById('uploadBtn').onclick = function() {
    if (currentUser) {
        toggleSections('uploadSection');
    } else {
        alert('Please log in to upload music.');
    }
};

document.getElementById('searchBtn').onclick = function() {
    toggleSections('searchSection');
};

document.getElementById('viewBtn').onclick = function() {
    toggleSections('musicList');
    loadMusic();
};

document.getElementById('submitUpload').onclick = function() {
    const title = document.getElementById('titleInput').value;
    const artist = document.getElementById('artistInput').value;
    const genre = document.getElementById('genreInput').value;
    const audioInput = document.getElementById('audioInput').files[0];
    const coverInput = document.getElementById('coverInput').files[0];

    if (title && artist && genre && audioInput && coverInput) {
        const reader = new FileReader();
        reader.onload = function() {
            const musicData = {
                title: title,
                artist: artist,
                genre: genre,
                audio: reader.result,
                cover: URL.createObjectURL(coverInput),
                uploadedBy: currentUser // Save the uploader's username
            };
            saveMusic(musicData);
        };
        reader.readAsArrayBuffer(audioInput);
    } else {
        alert('Please fill in all fields and select both audio and cover image.');
    }
};

document.getElementById('searchButton').onclick = function() {
    const query = document.getElementById('searchQuery').value.toLowerCase();
    if (query) {
        searchMusic(query);
    } else {
        alert('Please enter a search term.');
    }
};

function updateAuthStatus() {
    const authStatus = document.getElementById('authStatus');
    if (currentUser) {
        authStatus.textContent = `Logged in as: ${currentUser}`;
        document.getElementById('uploadBtn').classList.remove('hidden');
        document.getElementById('searchBtn').classList.remove('hidden');
        document.getElementById('viewBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        document.getElementById('signupBtn').classList.add('hidden');
        document.getElementById('loginBtn').classList.add('hidden');
    } else {
        authStatus.textContent = 'Not logged in';
        document.getElementById('uploadBtn').classList.add('hidden');
        document.getElementById('searchBtn').classList.add('hidden');
        document.getElementById('viewBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('signupBtn').classList.remove('hidden');
        document.getElementById('loginBtn').classList.remove('hidden');
    }
}

function toggleSections(sectionId) {
    const sections = ['signupSection', 'loginSection', 'uploadSection', 'searchSection', 'musicList'];
    sections.forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== sectionId);
    });
}

function saveMusic(musicData) {
    const transaction = db.transaction(['music'], 'readwrite');
    const musicStore = transaction.objectStore('music');
    musicStore.add(musicData);
    transaction.oncomplete = function() {
        alert('Music uploaded successfully!');
        loadMusic();
        clearUploadForm();
    };
}

function loadMusic() {
    const transaction = db.transaction(['music'], 'readonly');
    const musicStore = transaction.objectStore('music');
    const request = musicStore.getAll();

    request.onsuccess = function(event) {
        const musicList = event.target.result;
        const musicUl = document.getElementById('musicUl');
        musicUl.innerHTML = '';
        musicList.forEach(music => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${music.cover}" alt="${music.title}" style="width:50px;">
                <strong>${music.title}</strong> by ${music.artist} (${music.genre})
                <audio controls src="${URL.createObjectURL(new Blob([music.audio]))}"></audio>
                <button onclick="editMusic(${music.id})"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteMusic(${music.id})"><i class="fas fa-trash"></i> Delete</button>
            `;
            musicUl.appendChild(li);
        });
    };
}

function editMusic(musicId) {
    const transaction = db.transaction(['music'], 'readonly');
    const musicStore = transaction.objectStore('music');
    const request = musicStore.get(musicId);

    request.onsuccess = function(event) {
        const music = event.target.result;
        if (music) {
            document.getElementById('titleInput').value = music.title;
            document.getElementById('artistInput').value = music.artist;
            document.getElementById('genreInput').value = music.genre;

            const audioInput = document.getElementById('audioInput');
            const coverInput = document.getElementById('coverInput');
            audioInput.value = ''; // Reset the file input
            coverInput.value = ''; // Reset the file input

            const submitUpload = document.getElementById('submitUpload');
            submitUpload.onclick = function() {
                const updatedMusicData = {
                    id: musicId,
                    title: document.getElementById('titleInput').value,
                    artist: document.getElementById('artistInput').value,
                    genre: document.getElementById('genreInput').value,
                    audio: music.audio,
                    cover: music.cover,
                    uploadedBy: music.uploadedBy
                };
                updateMusic(updatedMusicData);
            };
            toggle
toggleSections('uploadSection'); // Switch to the upload section to edit
        }
    };
}

function updateMusic(updatedMusicData) {
    const transaction = db.transaction(['music'], 'readwrite');
    const musicStore = transaction.objectStore('music');
    const request = musicStore.put(updatedMusicData); // Use put to update existing record

    request.onsuccess = function() {
        alert('Music updated successfully!');
        loadMusic(); // Reload music to reflect changes
        clearUploadForm();
    };

    request.onerror = function() {
        alert('Error updating music.');
    };
}

function deleteMusic(musicId) {
    const transaction = db.transaction(['music'], 'readwrite');
    const musicStore = transaction.objectStore('music');
    const request = musicStore.delete(musicId); // Delete the music entry by ID

    request.onsuccess = function() {
        alert('Music deleted successfully!');
        loadMusic(); // Reload the music list after deletion
    };

    request.onerror = function() {
        alert('Error deleting music.');
    };
}

function searchMusic(query) {
    const transaction = db.transaction(['music'], 'readonly');
    const musicStore = transaction.objectStore('music');
    const request = musicStore.getAll();

    request.onsuccess = function(event) {
        const musicList = event.target.result;
        const filteredMusic = musicList.filter(music =>
            music.title.toLowerCase().includes(query) ||
            music.artist.toLowerCase().includes(query) ||
            music.genre.toLowerCase().includes(query)
        );
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';
        if (filteredMusic.length === 0) {
            searchResults.innerHTML = '<p>No results found.</p>';
        } else {
            filteredMusic.forEach(music => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <img src="${music.cover}" alt="${music.title}" style="width:50px;">
                    <strong>${music.title}</strong> by ${music.artist} (${music.genre})
                    <audio controls src="${URL.createObjectURL(new Blob([music.audio]))}"></audio>
                    <button onclick="editMusic(${music.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteMusic(${music.id})"><i class="fas fa-trash"></i> Delete</button>
                `;
                searchResults.appendChild(li);
            });
        }
    };
}

function clearUploadForm() {
    document.getElementById('titleInput').value = '';
    document.getElementById('artistInput').value = '';
    document.getElementById('genreInput').value = '';
    document.getElementById('audioInput').value = '';
    document.getElementById('coverInput').value = '';
}

// Event Listeners for Section Toggles
document.getElementById('uploadBtn').addEventListener('click', function() {
    toggleSections('uploadSection');
});

document.getElementById('searchBtn').addEventListener('click', function() {
    toggleSections('searchSection');
});

// You may add more event listeners as needed
