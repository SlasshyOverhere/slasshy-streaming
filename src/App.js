import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import axios from 'axios';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setAppLoading(false);
    }
  }, [isLoading]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
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
        // Use backend API to proxy TMDB requests (keeps API key secure)
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const searchUrl = `${apiUrl}/api/search/${contentType}?query=${encodeURIComponent(searchQuery)}&page=1`;
        
        try {
          const response = await axios.get(searchUrl);
          setSearchResults(response.data.results || []);
        } catch (apiError) {
          if (apiError.response?.status === 404 || apiError.code === 'ECONNREFUSED') {
            alert('Backend API is not running. Please start the API server (see api/README.md for instructions).');
          } else if (apiError.response?.data?.error) {
            alert(`Search failed: ${apiError.response.data.error}`);
          } else {
            throw apiError; // Re-throw to be caught by outer catch
          }
          setSearching(false);
          return;
        }
      }
      
      setSearching(false);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
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
  if (appLoading) {
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
              <p>Slasshy Streaming © 2025</p>
            </div>
          </div>
          
          <footer className="login-footer">
            <p>Slasshy Streaming © 2025</p>
          </footer>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="app">
      {showUnavailableDialog && (
        <div className="modal-overlay">
          <div className="modal-content unavailable-dialog">
            <h2>⚠️ Content Not Available</h2>
            <p>Sorry, this content is currently not available on Videasy streaming.</p>
            <p className="unavailable-note">Try searching for another movie or show.</p>
            <button onClick={closeUnavailableDialog} className="btn btn-primary">
              ← Back to Search
            </button>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <button onClick={() => setSelectedMedia(null)} className="logo" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
            <span className="logo-icon">🎬</span>
            Slasshy
          </button>
          <div className={`header-actions ${isMenuOpen ? 'active' : ''}`}>
            <div className="user-info">
              <img src={user.picture} alt={user.name} className="user-avatar" />
              <span className="user-name">{user.name}</span>
            </div>
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="btn btn-secondary">
              Logout
            </button>
          </div>
          <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
        </div>
      </header>

      <main className="container">
        {!selectedMedia ? (
          <>
            <section className="search-section">
              <h1 className="section-title">Find Your Next Favorite</h1>
              
              <div className="content-type-tabs">
                <button
                  className={`tab ${contentType === 'movie' ? 'active' : ''}`}
                  onClick={() => setContentType('movie')}
                >
                  Movies
                </button>
                <button
                  className={`tab ${contentType === 'tv' ? 'active' : ''}`}
                  onClick={() => setContentType('tv')}
                >
                  TV Shows
                </button>
                <button
                  className={`tab ${contentType === 'anime' ? 'active' : ''}`}
                  onClick={() => setContentType('anime')}
                >
                  Anime
                </button>
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  placeholder={`Search for ${contentType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                />
                <button onClick={handleSearch} disabled={searching} className="btn btn-primary search-btn">
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </section>

            <section className="direct-play-section">
              <h3>Quick Play with ID</h3>
              <p className="subtitle">
                {contentType === 'anime' ? 'Enter an Anilist ID' : 'Enter a TMDB ID'}
              </p>
              
              <div className="direct-play-form">
                <input
                  type="text"
                  placeholder="Enter ID..."
                  value={directId}
                  onChange={(e) => setDirectId(e.target.value)}
                  className="input-field"
                  onKeyPress={(e) => e.key === 'Enter' && handleDirectPlay()}
                />
                
                {(contentType === 'tv' || contentType === 'anime') && (
                  <div className="episode-inputs">
                    {contentType === 'tv' && (
                      <input
                        type="number"
                        placeholder="S"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="input-field episode-input"
                        min="1"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="E"
                      value={episode}
                      onChange={(e) => setEpisode(e.target.value)}
                      className="input-field episode-input"
                      min="1"
                    />
                  </div>
                )}

                {contentType === 'anime' && (
                  <label className="dub-toggle">
                    <input
                      type="checkbox"
                      checked={isDub}
                      onChange={(e) => setIsDub(e.target.checked)}
                    />
                    <span>Dub</span>
                  </label>
                )}
                
                <button onClick={handleDirectPlay} className="btn btn-secondary">
                  Play Now
                </button>
              </div>
            </section>

            {searchResults.length > 0 && (
              <section className="results-section">
                <h2 className="section-title" style={{ textAlign: 'left', fontSize: '1.75rem' }}>Results</h2>
                <div className="results-grid">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="result-card"
                      onClick={() => handleSelectMedia(item)}
                    >
                      <div className="result-poster">
                        {item.poster_path ? (
                          <img
                            src={item.isAnime ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title || item.name}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem', color: 'var(--text-secondary)' }}>
                            {contentType === 'movie' ? '🎬' : contentType === 'tv' ? '📺' : '🎌'}
                          </div>
                        )}
                        {item.vote_average > 0 && (
                          <div className="rating">
                            ⭐ {item.vote_average.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="result-info">
                        <h4>{item.title || item.name}</h4>
                        <p className="year">
                          {new Date(item.release_date || item.first_air_date).getFullYear() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="player-section">
            <button className="btn btn-secondary back-btn" onClick={handleBackToSearch}>
              ← Back to Search
            </button>

            {(selectedMedia.type === 'tv' || (selectedMedia.isAnime && selectedMedia.animeFormat !== 'MOVIE')) && (
              <div className="player-controls">
                {selectedMedia.type === 'tv' && (
                  <input
                    type="number"
                    placeholder="Season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="input-field episode-input"
                    min="1"
                  />
                )}
                <input
                  type="number"
                  placeholder="Episode"
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                  className="input-field episode-input"
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
                <button onClick={() => setSelectedMedia({...selectedMedia})} className="btn btn-secondary">
                  Update
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
                {selectedMedia.poster && (
                  <img src={selectedMedia.poster} alt={selectedMedia.title} className="info-poster" />
                )}
                <div className="info-right">
                  <h2>{selectedMedia.title}</h2>
                  <div className="info-meta">
                    {selectedMedia.year && (
                      <span className="meta-badge">
                        📅 {new Date(selectedMedia.year).getFullYear()}
                      </span>
                    )}
                    {selectedMedia.rating > 0 && (
                      <span className="meta-badge">
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
                      className="btn btn-primary"
                    >
                      View on {selectedMedia.isAnime ? 'Anilist' : 'TMDB'}
                    </a>
                    <button onClick={() => setShowUnavailableDialog(true)} className="btn btn-secondary">
                      Report Issue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Slasshy Streaming © 2025</p>
      </footer>
    </div>
  );
}

export default App;
