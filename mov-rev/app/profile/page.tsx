"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
	const [user, setUser] = useState<any>(null);
	const [error, setError] = useState("");

	const deleteUser = async () => {
		if (!user) return;
		try {
			const response = await fetch("/api/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: user.username }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to delete user");
			}
			setUser(null);
			alert("Account deleted successfully!");
			// Optionally redirect to home
			globalThis.location.href = "/";
		} catch (err) {
			console.error(err);
			setError("Error deleting user. Please try again.");
		}
	};

	const logoutUser = async () => {
		try {
			const response = await fetch("/api/logout", {
				method: "GET",
				credentials: "include",
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to logout");
			}
			setUser(null);
			alert("Logged out successfully!");
			// Optionally redirect to home
			globalThis.location.href = "/";
		} catch (err) {
			console.error(err);
			setError("Error logging out. Please try again.");
		}
	};

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch("/api/user", { method: "GET" });
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.message || "Failed to fetch profile"
					);
				}
				const data = await response.json();
				setUser(data);
			} catch (err) {
				console.error(err);
				setError("Error getting profile info. Please try login first.");
			}
		};

		fetchProfile();
	}, []);

	return (
		<div>
			<h1 className="text-2xl text-center font-bold mb-4">My Profile</h1>
			<div className="max-w-md mx-auto p-4">
				{error && <p className="text-red-500">{error}</p>}
				{user ? (
					<p>
						<strong>Username:</strong> {user.username}
					</p>
				) : (
					<p>Loading...</p>
				)}
				{user && (
					<div className="mt-4 space-y-2">
						<button
							onClick={async () => {
								await logoutUser();
							}}
							className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 border border-blue-600">
							Logout
						</button>
						<button
							onClick={async () => {
								await deleteUser();
							}}
							className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 border border-red-600">
							Delete Account
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
