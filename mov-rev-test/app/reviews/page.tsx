"use client";
import { useState, useEffect, useRef } from "react";

interface Review {
	imdbId: string;
	user?: {
		id: number;
		username: string;
	};
	title: string;
	rating: string;
	text: string;
	createdAt: string;
}

export default function ReviewPage() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const fetched = useRef(false);

	const fetchStreamedReviews = async () => {
		if (fetched.current) return;
		fetched.current = true;

		const res = await fetch("/api/stream-reviews");
		const reader = res.body?.getReader();
		const decoder = new TextDecoder();

		while (reader) {
			const { done, value } = await reader.read();
			if (done) break;

			decoder
				.decode(value)
				.split("\n")
				.forEach((line) => {
					if (line.trim()) {
						try {
							setReviews((prev) => [...prev, JSON.parse(line)]);
						} catch {}
					}
				});
		}
	};

	useEffect(() => {
		fetchStreamedReviews();
	}, []);

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Movie Reviews</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{reviews.map((review, index) => (
					<div
						key={`${review.imdbId}-${index}`}
						className="p-4 border rounded">
						<h2 className="text-lg font-semibold">
							{review.title}
						</h2>
						<p className="text-sm text-gray-600">
							By: {review.user?.username || "Unknown"}
						</p>
						<p className="text-yellow-500">
							Rating: {review.rating}/10
						</p>
						<p className="mt-2">{review.text}</p>
						<p className="text-xs text-gray-400 mt-2">
							{new Date(review.createdAt).toLocaleDateString()}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
