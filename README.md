**Movie Watchlist + Public Review System**

A simple web application for searching movies, saving them to a personal watchlist, rating and writing reviews, and publishing reviews to a public page. The app integrates with the OMDb API for movie data and provides user profiles, public reviews, and basic social features.

**Features**
- **Search**: Search movies using the OMDb API.
- **Watchlist**: Add or remove movies from a personal watchlist.
- **Rate & Review**: Give movies a rating and write a text review.
- **Public Reviews**: Browse reviews left by other users on a public reviews page.
- **Profile**: View a user's profile with their watchlist and reviews.


**Usage (high level)**
- **Search movies**: Use the search UI to query titles; the app calls OMDb and shows results.
- **Add to watchlist**: Click "Add" on a movie to save it to your personal watchlist.
- **Rate & Review**: Open a saved movie or movie detail page to add a numeric rating and write a review.
- **Public reviews page**: Visit the public reviews section to read others' reviews, sorted or filtered by movie or user.
- **Profile page**: Visit your profile to view your watchlist and authored reviews.

**API & Data notes**
- Movie metadata (title, year, poster, plot, etc.) comes from OMDb. Store only the necessary metadata locally to avoid excess API calls.
- Keep user reviews, ratings, and watchlist entries in your database. Link reviews to movie IDs (e.g., IMDB ID from OMDb).
- Respect OMDb usage rules and rate limits.

**Example endpoints (server)**
- `GET /api/search?q=:query` — Proxy to OMDb search.
- `POST /api/watchlist` — Add movie to current user's watchlist.
- `GET /api/watchlist` — Get current user's watchlist.
- `POST /api/reviews` — Submit a review (movie id, rating, text).
- `GET /api/reviews` — Get public reviews (with filters for movie/user).
- `GET /api/profile/:userId` — Get public profile data.

**Suggested database schema (simple)**
- `users` (id, name, email, hashed_password, created_at)
- `movies` (id, imdb_id, title, year, poster, cached_at)
- `watchlist` (id, user_id, movie_id, added_at)
- `reviews` (id, user_id, movie_id, rating, text, created_at)

**Testing**
- Add unit tests for API routes and components. Use a test database or mock services for OMDb.

**File layout (example)**
- `client/` — frontend app
- `server/` — backend API
- `db/` — migrations / seed scripts
- `.env` — environment variables (not committed)

**Contributing**
- Fork the repo, create a branch, add tests, and open a PR. Document important decisions and any migration steps.

**License**
- (MIT License).



---
