# Slasshy Streaming API

Backend API server that proxies TMDB API requests to keep the API key secure on the server side.

## Setup

1. Install dependencies:
```bash
cd api
npm install
```

2. Create a `.env` file in the `api` folder:
```env
TMDB_API_KEY=your_tmdb_api_key_here
PORT=3001
```

   Get your TMDB API key from: https://www.themoviedb.org/settings/api

3. Start the server:
```bash
npm start
```

   For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Search
- `GET /api/search/:contentType?query=:query&page=:page`
  - `contentType`: `movie` or `tv`
  - `query`: Search query string
  - `page`: Page number (optional, defaults to 1)

### Get Details
- `GET /api/:contentType/:id`
  - `contentType`: `movie` or `tv`
  - `id`: TMDB ID

## Environment Variables

- `TMDB_API_KEY` (required): Your TMDB API key
- `PORT` (optional): Server port (defaults to 3001)

## Security

The API key is stored securely on the server and never exposed to the client. All TMDB requests are proxied through this backend API.

