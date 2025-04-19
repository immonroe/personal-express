document.addEventListener('DOMContentLoaded', () => {
  fetch('/current-cat')
    .then(res => res.json())
    .then(data => {
      if (data && data.catImageUrl) {
        showCatImage(data.catImageUrl);
      }
    })
    .catch(error => console.error('Error loading current cat image:', error));

  document.getElementById('generateCat').addEventListener('click', fetchCatImage);
});

function fetchCatImage() {
  fetch('https://api.thecatapi.com/v1/images/search')
    .then(res => res.json())
    .then(data => {
      const catImageUrl = data[0].url;
      showCatImage(catImageUrl);

      // Save it server-side
      fetch('/current-cat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ catImageUrl })
      }).catch(error => console.error('Error updating cat image:', error));
    })
    .catch(error => console.error('Error fetching cat image:', error));
}

// ran into bug where cat would sometimes not show on page load and entire app would crash lol
function showCatImage(url) {
  const container = document.querySelector('.cat-container');
  let img = document.getElementById('catImage');
  const msg = document.getElementById('message');

  if (!img) {
    img = document.createElement('img');
    img.id = 'catImage';
    img.alt = 'Cat image';
    container.appendChild(img);
  }

  img.src = url;

  if (msg) msg.style.display = 'none';
}
