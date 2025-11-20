"use client";

import { useEffect, useState } from "react";

export default function WatchlistPage() {
	interface Movie {
		imdbId: string;
		title: string;
		year: string;
	}
	interface Review {
		rating: string;
		text: string;
	}

	const [watchlist, setWatchlist] = useState<Movie[]>([]);
	const [reviews, setReviews] = useState<{ [imdbId: string]: Review }>({});
	const [error, setError] = useState("");
	const [reviewData, setReviewData] = useState<{
		[imdbId: string]: { rating: string; text: string };
	}>({});

	const fetchWatchlist = async () => {
		try {
			const response = await fetch("/api/watchlist", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to fetch watchlist"
				);
			}
			const data = await response.json();
			setWatchlist(data.watchlist);
		} catch (err) {
			console.error(err);
			setError("Error fetching watchlist. Please try again.");
		}
	};

	const handleRemove = async (imdbId: string) => {
		try {
			const response = await fetch("/api/watchlist", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imdbId }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to remove from watchlist"
				);
			}
			// Update state by filtering out the removed item
			setWatchlist((prev) =>
				prev.filter((movie) => movie.imdbId !== imdbId)
			);
			alert("Removed from watchlist!");
		} catch (err) {
			console.error(err);
			setError("Error removing from watchlist. Please try again.");
		}
	};

	const handleAddReview = async (imdbId: string) => {
		const data = reviewData[imdbId];
		if (!data || !data.rating || !data.text) {
			alert("Please enter both rating and review text.");
			return;
		}
		const rating = parseInt(data.rating);
		if (isNaN(rating) || rating < 1 || rating > 10) {
			alert("Rating must be a number between 1 and 10.");
			return;
		}

		try {
			const response = await fetch("/api/review", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imdbId, rating, text: data.text }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to add review");
			}
			alert("Review added successfully!");

			// Clear the input fields
			setReviewData((prev) => ({
				...prev,
				[imdbId]: { rating: "", text: "" },
			}));
			// Refetch reviews to update the display
			fetchReviews();
		} catch (err) {
			console.error(err);
			setError("Error adding review. Please try again.");
		}
	};

	const fetchReviews = async () => {
		try {
			const response = await fetch("/api/review", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to fetch reviews");
			}
			const data = await response.json();
			setReviewData(data.reviews);
		} catch (err) {
			console.error(err);
			setError("Error fetching reviews. Please try again.");
		}
    };
    const deleteReview = async (imdbId: string) => {
        try {
            const response = await fetch("/api/review", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imdbId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete review");
            }
            alert("Review deleted successfully!");
            setReviewData((prev) => {
                const newState = { ...prev };
                delete newState[imdbId];
                return newState;
            });
        } catch (err) {
            console.error(err);
            setError("Error deleting review. Please try again.");
        }
    };

	useEffect(() => {
		fetchWatchlist();
		fetchReviews();
	}, []);

	return (
		<div>
			<h1 className="text-2xl font-bold mb-4">My Watchlist</h1>
			{error && <p className="text-red-500">{error}</p>}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{watchlist.map((movie) => (
					<div key={movie.imdbId} className="p-4 border rounded">
						<h2 className="text-lg font-semibold">{movie.title}</h2>
						<p>{movie.year}</p>
						<button
							onClick={() => handleRemove(movie.imdbId)}
							className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
							Remove
						</button>
						<div>
							Your Review:{" "}
							{reviewData[movie.imdbId]?.text || "No review yet"}
						</div>
						<div>
							Your Rating:{" "}
							{reviewData[movie.imdbId]?.rating ||
								"No rating yet"}
						</div>
						<div className="mt-4">
							<input
								type="number"
								min="1"
								max="10"
								placeholder="Rating (1-10)"
								// value={reviewData[movie.imdbId]?.rating || ""}
								onChange={(e) =>
									setReviewData((prev) => ({
										...prev,
										[movie.imdbId]: {
											...(prev[movie.imdbId] || {}),
											rating: e.target.value,
										},
									}))
								}
								className="w-full p-2 border rounded mb-2"
							/>
							<textarea
								placeholder="Your review"
								// value={reviewData[movie.imdbId]?.text || ""}
								onChange={(e) =>
									setReviewData((prev) => ({
										...prev,
										[movie.imdbId]: {
											...(prev[movie.imdbId] || {}),
											text: e.target.value,
										},
									}))
								}
								className="w-full p-2 border rounded mb-2"
								rows={3}
							/>
							<button
								onClick={() => handleAddReview(movie.imdbId)}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
								Add Review
                            </button>
                            <button
                                onClick={() => deleteReview(movie.imdbId)}
                                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                                Delete Review
                            </button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
