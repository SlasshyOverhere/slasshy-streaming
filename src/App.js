import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import axios from 'axios';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('movie');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [directId, setDirectId] = useState('');
  const [isDub, setIsDub] = useState(false);
  const [showUnavailableDialog, setShowUnavailableDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const savedKey = localStorage.getItem('tmdb_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      } else {
        setShowApiKeyDialog(true);
      }
    }
  }, [isAuthenticated]);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      alert('Please enter a valid API key');
      return;
    }
    localStorage.setItem('tmdb_api_key', apiKey.trim());
    setShowApiKeyDialog(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    if (!apiKey) {
      alert('Please add TMDB API key first');
      setShowApiKeyDialog(true);
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      let searchUrl = '';
      if (contentType === 'anime') {
        const query = `
          query ($search: String) {
            Page(page: 1, perPage: 20) {
              media(search: $search, type: ANIME) {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
                averageScore
                startDate {
                  year
                }
                format
              }
            }
          }
        `;
        
        const response = await axios.post('https://graphql.anilist.co', {
          query: query,
          variables: { search: searchQuery }
        });

        const animeResults = response.data.data.Page.media.map(anime => ({
          id: anime.id,
          title: anime.title.english || anime.title.romaji,
          poster_path: anime.coverImage.large,
          vote_average: anime.averageScore / 10,
          release_date: anime.startDate.year,
          isAnime: true,
          animeFormat: anime.format
        }));

        setSearchResults(animeResults);
      } else {
        searchUrl = `https://api.themoviedb.org/3/search/${contentType}?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&page=1`;
        
        const response = await axios.get(searchUrl);
        setSearchResults(response.data.results || []);
      }
      
      setSearching(false);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check your API key.');
      setSearching(false);
    }
  };

  const handleSelectMedia = (media) => {
    setSeason('1');
    setEpisode('1');
    
    let actualType = contentType;
    if (media.isAnime) {
      actualType = media.animeFormat === 'MOVIE' ? 'movie' : 'tv';
    }
    
    setSelectedMedia({
      id: media.id,
      title: media.title || media.name,
      poster: media.poster_path ? (media.isAnime ? media.poster_path : `https://image.tmdb.org/t/p/w500${media.poster_path}`) : null,
      backdrop: media.backdrop_path ? `https://image.tmdb.org/t/p/original${media.backdrop_path}` : null,
      overview: media.overview,
      rating: media.vote_average,
      year: media.release_date || media.first_air_date,
      type: actualType,
      isAnime: media.isAnime || false,
      animeFormat: media.animeFormat
    });
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleDirectPlay = () => {
    if (!directId.trim()) {
      alert('Please enter an ID');
      return;
    }

    setSelectedMedia({
      id: directId.trim(),
      title: `${contentType === 'movie' ? 'Movie' : contentType === 'tv' ? 'TV Show' : 'Anime'} ID: ${directId}`,
      type: contentType,
      direct: true,
      isAnime: contentType === 'anime'
    });
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const getVideasyUrl = () => {
    if (!selectedMedia) return '';
    
    if (selectedMedia.isAnime) {
      const isAnimeMovie = selectedMedia.animeFormat === 'MOVIE';
      
      if (isAnimeMovie) {
        return `https://player.videasy.net/anime/${selectedMedia.id}?dub=${isDub}&color=E50914&overlay=true`;
      } else {
        return `https://player.videasy.net/anime/${selectedMedia.id}/${episode}?dub=${isDub}&color=E50914&overlay=true`;
      }
    } else if (selectedMedia.type === 'movie') {
      return `https://player.videasy.net/movie/${selectedMedia.id}?color=E50914&overlay=true`;
    } else {
      return `https://player.videasy.net/tv/${selectedMedia.id}/${season}/${episode}?color=E50914&overlay=true&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true`;
    }
  };

  const handleBackToSearch = () => {
    setSelectedMedia(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIframeError = () => {
    setShowUnavailableDialog(true);
  };

  const closeUnavailableDialog = () => {
    setShowUnavailableDialog(false);
    handleBackToSearch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-logo">
            <span className="login-logo-icon">🎬</span>
            <h1>Slasshy Streaming</h1>
            <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
            <p style={{ color: '#999' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-logo">
            <span className="login-logo-icon">🎬</span>
            <h1>Slasshy Streaming</h1>
            <p className="login-subtitle">Premium Streaming Access</p>
          </div>
          
          <div className="login-form">
            <div className="login-icon-lock">🔒</div>
            <h2>Secure Authentication</h2>
            <p className="login-description">Sign in with your Auth0 account to continue</p>
            
            <button onClick={() => loginWithRedirect()} className="login-btn">
              🔓 Sign In with Auth0
            </button>
            
            <div className="auth0-badge">
              <p>Powered by Auth0 • Secure & Private</p>
            </div>
          </div>
          
          <footer className="login-footer">
            <p>Powered by Videasy • Slasshy © 2025</p>
          </footer>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="app">
      {showApiKeyDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🔑 Enter TMDB API Key</h2>
            <p>Get your free API key from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">TMDB</a></p>
            <input
              type="text"
              placeholder="Enter your TMDB API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="api-key-input"
              onKeyPress={(e) => e.key === 'Enter' && saveApiKey()}
            />
            <button onClick={saveApiKey} className="save-btn">
              💾 Save & Continue
            </button>
          </div>
        </div>
      )}

      {showUnavailableDialog && (
        <div className="modal-overlay">
          <div className="modal-content unavailable-dialog">
            <div className="unavailable-icon">⚠️</div>
            <h2>Content Not Available</h2>
            <p>Sorry, this content is currently not available on Videasy streaming.</p>
            <p className="unavailable-note">Try searching for another movie or show.</p>
            <button onClick={closeUnavailableDialog} className="save-btn">
              ← Back to Search
            </button>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-icon">🎬</span>
            Slasshy Streaming
          </h1>
          <div className="header-actions">
            <div className="user-info">
              <img src={user.picture} alt={user.name} className="user-avatar" />
              <span className="user-name">{user.name}</span>
            </div>
            <button onClick={() => setShowApiKeyDialog(true)} className="settings-btn">
              ⚙️ API Key
            </button>
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {!selectedMedia ? (
          <>
            <div className="search-section">
              <h2 className="section-title">Search & Stream</h2>
              
              <div className="content-type-tabs">
                <button
                  className={`tab ${contentType === 'movie' ? 'active' : ''}`}
                  onClick={() => setContentType('movie')}
                >
                  🎬 Movies
                </button>
                <button
                  className={`tab ${contentType === 'tv' ? 'active' : ''}`}
                  onClick={() => setContentType('tv')}
                >
                  📺 TV Shows
                </button>
                <button
                  className={`tab ${contentType === 'anime' ? 'active' : ''}`}
                  onClick={() => setContentType('anime')}
                >
                  🎌 Anime
                </button>
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  placeholder={`Search for ${contentType === 'movie' ? 'movies' : contentType === 'tv' ? 'TV shows' : 'anime'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                />
                <button onClick={handleSearch} disabled={searching} className="search-btn">
                  {searching ? '🔍 Searching...' : '🔍 Search'}
                </button>
              </div>
            </div>

            <div className="direct-play-section">
              <h3>🎯 Quick Play with ID</h3>
              <p className="subtitle">
                {contentType === 'anime' ? 'Enter Anilist ID (e.g., 21 for One Piece)' : 
                 contentType === 'movie' ? 'Enter TMDB Movie ID (e.g., 299534 for Avengers: Endgame)' :
                 'Enter TMDB TV Show ID (e.g., 1399 for Game of Thrones)'}
              </p>
              
              <div className="direct-play-form">
                <input
                  type="text"
                  placeholder={`Enter ${contentType === 'anime' ? 'Anilist' : 'TMDB'} ID`}
                  value={directId}
                  onChange={(e) => setDirectId(e.target.value)}
                  className="direct-id-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleDirectPlay()}
                />
                
                {contentType === 'tv' && (
                  <div className="episode-inputs">
                    <input
                      type="number"
                      placeholder="Season"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="episode-input"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Episode"
                      value={episode}
                      onChange={(e) => setEpisode(e.target.value)}
                      className="episode-input"
                      min="1"
                    />
                  </div>
                )}

                {contentType === 'anime' && (
                  <>
                    <input
                      type="number"
                      placeholder="Episode"
                      value={episode}
                      onChange={(e) => setEpisode(e.target.value)}
                      className="episode-input"
                      min="1"
                    />
                    <label className="dub-toggle">
                      <input
                        type="checkbox"
                        checked={isDub}
                        onChange={(e) => setIsDub(e.target.checked)}
                      />
                      <span>Dubbed</span>
                    </label>
                  </>
                )}
                
                <button onClick={handleDirectPlay} className="play-btn">
                  ▶️ Play Now
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="results-section">
                <h3>📋 Results ({searchResults.length})</h3>
                <div className="results-grid">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="result-card"
                      onClick={() => handleSelectMedia(item)}
                    >
                      <div className="result-poster">
                        {item.poster_path ? (
                          <>
                            <img
                              src={item.isAnime ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                              alt={item.title || item.name}
                              loading="lazy"
                            />
                            {item.vote_average > 0 && (
                              <div className="rating">
                                ⭐ {item.vote_average.toFixed(1)}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="poster-placeholder">
                            {contentType === 'movie' ? '🎬' : contentType === 'tv' ? '📺' : '🎌'}
                          </div>
                        )}
                        <div className="hover-overlay">
                          <div className="play-icon">▶</div>
                        </div>
                      </div>
                      <div className="result-info">
                        <h4>{item.title || item.name}</h4>
                        <p className="year">
                          {typeof item.release_date === 'string' ? item.release_date.substring(0, 4) : 
                           typeof item.first_air_date === 'string' ? item.first_air_date.substring(0, 4) : 
                           item.release_date || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="player-section">
            <button className="back-btn" onClick={handleBackToSearch}>
              ← Back to Search
            </button>

            <div className="player-layout-fullwidth">
              <div className="player-container-large">
                {(selectedMedia.type === 'tv' || (selectedMedia.isAnime && selectedMedia.animeFormat !== 'MOVIE')) && (
                  <div className="player-controls">
                    {selectedMedia.type === 'tv' && (
                      <input
                        type="number"
                        placeholder="Season"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="control-input"
                        min="1"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Episode"
                      value={episode}
                      onChange={(e) => setEpisode(e.target.value)}
                      className="control-input"
                      min="1"
                    />
                    {selectedMedia.isAnime && (
                      <label className="dub-toggle">
                        <input
                          type="checkbox"
                          checked={isDub}
                          onChange={(e) => setIsDub(e.target.checked)}
                        />
                        <span>Dubbed</span>
                      </label>
                    )}
                    <button onClick={() => setSelectedMedia({...selectedMedia})} className="update-btn">
                      🔄 Update
                    </button>
                  </div>
                )}

                <div className="video-wrapper-large">
                  <iframe
                    src={getVideasyUrl()}
                    className="video-iframe"
                    frameBorder="0"
                    allowFullScreen
                    allow="encrypted-media; autoplay"
                    title={selectedMedia.title}
                    onError={handleIframeError}
                  />
                </div>

                {!selectedMedia.direct && (
                  <div className="media-info-below">
                    <div className="info-row">
                      <div className="info-left">
                        {selectedMedia.poster && (
                          <img src={selectedMedia.poster} alt={selectedMedia.title} className="info-poster" />
                        )}
                      </div>
                      <div className="info-right">
                        <h2>{selectedMedia.title}</h2>
                        <div className="info-meta">
                          {selectedMedia.year && (
                            <span className="meta-badge">
                              📅 {typeof selectedMedia.year === 'string' ? selectedMedia.year.substring(0, 4) : selectedMedia.year}
                            </span>
                          )}
                          {selectedMedia.rating > 0 && (
                            <span className="meta-badge rating-badge">
                              ⭐ {selectedMedia.rating.toFixed(1)}/10
                            </span>
                          )}
                        </div>
                        {selectedMedia.overview && (
                          <div className="info-overview">
                            <h3>Overview</h3>
                            <p>{selectedMedia.overview}</p>
                          </div>
                        )}
                        <div className="info-actions">
                          <a
                            href={selectedMedia.isAnime ? 
                              `https://anilist.co/anime/${selectedMedia.id}` :
                              `https://www.themoviedb.org/${selectedMedia.type}/${selectedMedia.id}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-btn"
                          >
                            View on {selectedMedia.isAnime ? 'Anilist' : 'TMDB'} →
                          </a>
                          <button onClick={() => setShowUnavailableDialog(true)} className="report-btn">
                            ⚠️ Report Issue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>Powered by <a href="https://www.videasy.net/" target="_blank" rel="noopener noreferrer">Videasy</a> • Slasshy Streaming © 2025</p>
      </footer>
    </div>
  );
}

export default App;
