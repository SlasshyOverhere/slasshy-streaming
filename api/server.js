const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// TMDB API base URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Get TMDB API key from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error('ERROR: TMDB_API_KEY is not set in environment variables!');
  console.error('Please create a .env file in the api folder with: TMDB_API_KEY=your_api_key');
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Proxy endpoint for TMDB search
app.get('/api/search/:contentType', async (req, res) => {
  try {
    const { contentType } = req.params;
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Validate contentType
    if (!['movie', 'tv'].includes(contentType)) {
      return res.status(400).json({ error: 'Invalid contentType. Must be "movie" or "tv"' });
    }

    // Make request to TMDB API
    const tmdbUrl = `${TMDB_BASE_URL}/search/${contentType}`;
    const response = await axios.get(tmdbUrl, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        page: page
      }
    });

    // Return the results
    res.json(response.data);
  } catch (error) {
    console.error('TMDB API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch data from TMDB',
      message: error.response?.data?.status_message || error.message
    });
  }
});

// Proxy endpoint for getting movie/TV details (if needed in the future)
app.get('/api/:contentType/:id', async (req, res) => {
  try {
    const { contentType, id } = req.params;

    if (!['movie', 'tv'].includes(contentType)) {
      return res.status(400).json({ error: 'Invalid contentType. Must be "movie" or "tv"' });
    }

    const tmdbUrl = `${TMDB_BASE_URL}/${contentType}/${id}`;
    const response = await axios.get(tmdbUrl, {
      params: {
        api_key: TMDB_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('TMDB API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch data from TMDB',
      message: error.response?.data?.status_message || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 TMDB API proxy is ready`);
});

