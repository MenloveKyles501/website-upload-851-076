(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var movies = window.movieSearchData || [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function createCard(movie) {
    return [
      '<article class="movie-card" data-title="', escapeHtml(movie.title.toLowerCase()), '">',
      '<a class="poster-link" href="', escapeHtml(movie.url), '">',
      '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
      '<span class="poster-badge">', escapeHtml(movie.type), '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="', escapeHtml(movie.url), '">', escapeHtml(movie.title), '</a></h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="meta-row"><span>', escapeHtml(movie.year), '</span><span>', escapeHtml(movie.region), '</span></div>',
      '<div class="tag-row"><span>', escapeHtml(movie.genre), '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function render(query) {
    var normalized = query.trim().toLowerCase();
    var matched = normalized
      ? movies.filter(function (movie) {
          return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
            .join(' ')
            .toLowerCase()
            .indexOf(normalized) !== -1;
        })
      : movies.slice(0, 80);

    if (results) {
      results.innerHTML = matched.slice(0, 120).map(createCard).join('');
    }

    if (empty) {
      empty.style.display = matched.length ? 'none' : '';
    }
  }

  if (!form || !input || !results) {
    return;
  }

  var initial = readQuery();
  input.value = initial;
  render(initial);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var nextUrl = query ? '?q=' + encodeURIComponent(query) : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
    render(query);
  });
})();
