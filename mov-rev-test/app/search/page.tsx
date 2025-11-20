"use client";

import { useState } from "react";

interface Movie {
	Title: string;
	Year: string;
	Poster: string;
	imdbID: string;
}

export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!query.trim()) return;

		setError("");
		setLoading(true);
		setResults([]);

		try {
			const response = await fetch(
				`http://www.omdbapi.com/?apikey=c6556721&s=${encodeURIComponent(
					query
				)}`
			);
			if (!response.ok) throw new Error("Failed to fetch data");
			const data = await response.json();
			setResults(data.Search || []);
		} catch (err) {
			setError("Error fetching data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleAddToWatchlist = async (movie: Movie) => {
		try {
			const response = await fetch("/api/watchlist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					imdbId: movie.imdbID,
					title: movie.Title,
					year: movie.Year,
				}),
			});
			if (!response.ok) {
				const errorData = await response.json();
				if (response.status === 401) {
					alert("You must be logged in to add to watchlist.");
					// Optionally redirect: window.location.href = '/login';
					return;
				}
				throw new Error(
					errorData.message || "Failed to add to watchlist"
				);
			}
			alert("Added to watchlist!");
		} catch (err) {
			console.error(err);
			alert("Error adding to watchlist. Please try again.");
		}
	};

	return (
		<div className="container mx-auto p-4">
			<form onSubmit={handleSubmit} className="flex gap-2 mb-4">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search Movies or TV Shows..."
					className="flex-1 p-2 border rounded"
					required
				/>
				<button
					type="submit"
					disabled={loading}
					className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
					{loading ? "Searching..." : "Search"}
				</button>
			</form>

			{error && <p className="text-red-500">{error}</p>}

			{loading && <p>Loading...</p>}

			{!loading && results.length === 0 && query && !error && (
				<p>No results found.</p>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{results.map((movie) => (
					<div key={movie.imdbID} className="border p-4 rounded">
						<div className="relative">
							{movie.Poster !== "N/A" ? (
								<img
									src={movie.Poster}
									alt={movie.Title}
									className="w-full h-64 object-cover mb-2"
									loading="lazy"
								/>
							) : (
								<div className="w-full h-64 bg-gray-200 flex items-center justify-center mb-2">
									No Image
								</div>
							)}
							<button
								onClick={() => handleAddToWatchlist(movie)}
								className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded m-2">
								+ Watchlist
							</button>
						</div>
						<h3 className="text-lg text-center font-bold">
							{movie.Title}
						</h3>
						<p className="text-gray-600 text-center ">
							{movie.Year}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
