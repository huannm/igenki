const apiKeys = {
  youtube: '',
  twitchClientId: '',
  twitchToken: '',
  steam: ''
};

const seedContent = [
  {
    id: crypto.randomUUID(),
    game: 'Monster Hunter Wilds',
    title: 'Beginner Hunting Route and Gear Setup',
    type: 'video',
    genre: 'Action RPG',
    platform: 'PC, Console',
    releaseDate: '2026-02-18',
    url: 'https://www.youtube.com/',
    source: 'YouTube',
    description: 'Step-by-step early game progression, weapon picks, and co-op prep.'
  },
  {
    id: crypto.randomUUID(),
    game: 'Counter-Strike 2',
    title: 'Smoke Lineups for Competitive Maps',
    type: 'instructions',
    genre: 'FPS',
    platform: 'PC',
    releaseDate: '2024-09-20',
    url: 'https://store.steampowered.com/',
    source: 'Steam Community',
    description: 'Detailed utility instructions for Dust II, Mirage, and Ancient.'
  },
  {
    id: crypto.randomUUID(),
    game: 'Hades II',
    title: 'Best Arcana Builds for Fast Clears',
    type: 'article',
    genre: 'Roguelike',
    platform: 'PC',
    releaseDate: '2025-11-01',
    url: 'https://www.ign.com/',
    source: 'Reputable Gaming Site',
    description: 'Meta build analysis with route planning and boon synergies.'
  },
  {
    id: crypto.randomUUID(),
    game: 'League of Legends',
    title: 'Macro Decision-Making by Game Phase',
    type: 'image',
    genre: 'MOBA',
    platform: 'PC',
    releaseDate: '2024-03-10',
    url: 'https://www.twitch.tv/',
    source: 'Twitch',
    description: 'Infographics showing objective priority and lane assignment.'
  }
];

const storageKey = 'hot-games-tutorials';
const getContent = () => JSON.parse(localStorage.getItem(storageKey) || 'null') || seedContent;
const saveContent = (content) => localStorage.setItem(storageKey, JSON.stringify(content));

const elements = {
  contentGrid: document.getElementById('contentGrid'),
  emptyState: document.getElementById('emptyState'),
  searchInput: document.getElementById('searchInput'),
  genreFilter: document.getElementById('genreFilter'),
  platformFilter: document.getElementById('platformFilter'),
  releaseFilter: document.getElementById('releaseFilter'),
  typeFilter: document.getElementById('typeFilter'),
  apiStatus: document.getElementById('apiStatus'),
  cmsPanel: document.getElementById('cmsPanel'),
  openCmsBtn: document.getElementById('openCmsBtn'),
  closeCmsBtn: document.getElementById('closeCmsBtn'),
  cmsForm: document.getElementById('cmsForm'),
  resetBtn: document.getElementById('resetBtn')
};

let contentItems = getContent();

function isFuture(dateString) {
  return new Date(dateString).getFullYear() >= 2026;
}

function getFilters() {
  return {
    query: elements.searchInput.value.trim().toLowerCase(),
    genre: elements.genreFilter.value,
    platform: elements.platformFilter.value,
    release: elements.releaseFilter.value,
    type: elements.typeFilter.value
  };
}

function applyFilters(items) {
  const f = getFilters();
  return items.filter((item) => {
    const haystack = `${item.game} ${item.title} ${item.description}`.toLowerCase();
    const queryMatch = !f.query || haystack.includes(f.query);
    const genreMatch = !f.genre || item.genre === f.genre;
    const platformMatch = !f.platform || item.platform.includes(f.platform);
    const typeMatch = !f.type || item.type === f.type;
    const releaseMatch = !f.release
      || (f.release === 'future' && isFuture(item.releaseDate))
      || (f.release === 'current' && !isFuture(item.releaseDate));

    return queryMatch && genreMatch && platformMatch && typeMatch && releaseMatch;
  });
}

function renderCards(items) {
  elements.contentGrid.innerHTML = '';
  elements.emptyState.classList.toggle('hidden', items.length > 0);

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'content-card';
    card.innerHTML = `
      <div>
        <span class="badge">${item.type}</span>
        <span class="badge">${item.genre}</span>
        <span class="badge">${item.platform}</span>
      </div>
      <h3>${item.game}: ${item.title}</h3>
      <p>${item.description}</p>
      <small>Release: ${item.releaseDate} • Source: ${item.source || 'Editorial'}</small>
      <p><a href="${item.url}" target="_blank" rel="noopener noreferrer">Open tutorial source</a></p>
      <button class="btn secondary" data-edit-id="${item.id}">Edit</button>
      <button class="btn secondary" data-delete-id="${item.id}">Delete</button>
    `;
    elements.contentGrid.appendChild(card);
  });
}

function refreshFilters() {
  const genres = [...new Set(contentItems.map((c) => c.genre))];
  const platforms = [...new Set(contentItems.flatMap((c) => c.platform.split(',').map((v) => v.trim())))];

  const fill = (el, values) => {
    const current = el.value;
    el.innerHTML = '<option value="">All</option>';
    values.sort().forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      el.appendChild(opt);
    });
    if ([...el.options].some((o) => o.value === current)) el.value = current;
  };

  fill(elements.genreFilter, genres);
  fill(elements.platformFilter, platforms);
}

function updateView() {
  refreshFilters();
  renderCards(applyFilters(contentItems));
}

function fillForm(item) {
  document.getElementById('contentId').value = item.id || '';
  document.getElementById('gameInput').value = item.game || '';
  document.getElementById('titleInput').value = item.title || '';
  document.getElementById('contentTypeInput').value = item.type || 'article';
  document.getElementById('genreInput').value = item.genre || '';
  document.getElementById('platformInput').value = item.platform || '';
  document.getElementById('releaseInput').value = item.releaseDate || '';
  document.getElementById('urlInput').value = item.url || '';
  document.getElementById('descriptionInput').value = item.description || '';
}

function serializeForm() {
  return {
    id: document.getElementById('contentId').value || crypto.randomUUID(),
    game: document.getElementById('gameInput').value.trim(),
    title: document.getElementById('titleInput').value.trim(),
    type: document.getElementById('contentTypeInput').value,
    genre: document.getElementById('genreInput').value.trim(),
    platform: document.getElementById('platformInput').value.trim(),
    releaseDate: document.getElementById('releaseInput').value,
    url: document.getElementById('urlInput').value.trim(),
    source: 'Editorial',
    description: document.getElementById('descriptionInput').value.trim()
  };
}

async function checkApiIntegrations() {
  const statuses = [];
  statuses.push(apiKeys.youtube ? 'YouTube API key configured.' : 'YouTube: add API key to enable live search.');
  statuses.push(apiKeys.twitchClientId && apiKeys.twitchToken
    ? 'Twitch API configured.'
    : 'Twitch: add client ID and token for stream/tutorial clips.');
  statuses.push(apiKeys.steam ? 'Steam API configured.' : 'Steam: add API key/app endpoint for game metadata.');

  elements.apiStatus.textContent = statuses.join(' ');
}

['searchInput', 'genreFilter', 'platformFilter', 'releaseFilter', 'typeFilter'].forEach((id) => {
  elements[id].addEventListener('input', updateView);
  elements[id].addEventListener('change', updateView);
});

elements.contentGrid.addEventListener('click', (e) => {
  const editId = e.target.getAttribute('data-edit-id');
  const deleteId = e.target.getAttribute('data-delete-id');

  if (editId) {
    const item = contentItems.find((c) => c.id === editId);
    if (item) {
      fillForm(item);
      elements.cmsPanel.classList.remove('hidden');
    }
  }

  if (deleteId) {
    contentItems = contentItems.filter((c) => c.id !== deleteId);
    saveContent(contentItems);
    updateView();
  }
});

elements.cmsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newItem = serializeForm();
  const existingIndex = contentItems.findIndex((c) => c.id === newItem.id);
  if (existingIndex >= 0) contentItems[existingIndex] = newItem;
  else contentItems.unshift(newItem);

  saveContent(contentItems);
  elements.cmsForm.reset();
  document.getElementById('contentId').value = '';
  updateView();
});

elements.resetBtn.addEventListener('click', () => {
  elements.cmsForm.reset();
  document.getElementById('contentId').value = '';
});

elements.openCmsBtn.addEventListener('click', () => elements.cmsPanel.classList.remove('hidden'));

elements.closeCmsBtn.addEventListener('click', () => elements.cmsPanel.classList.add('hidden'));

checkApiIntegrations();
updateView();
