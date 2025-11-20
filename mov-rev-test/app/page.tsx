"use client";

import { useState } from "react";

export default function Home() {
	const [regUsername, setRegUsername] = useState("");
	const [regPassword, setRegPassword] = useState("");
	const [regMessage, setRegMessage] = useState("");

	const [loginUsername, setLoginUsername] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [loginMessage, setLoginMessage] = useState("");

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setRegMessage("");
		const res = await fetch("/api/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: regUsername,
				password: regPassword,
			}),
		});
		const data = await res.json();
		setRegMessage(data.message || data.error || "Something went wrong");
		if (res.ok) {
			setRegUsername("");
			setRegPassword("");
		}
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoginMessage("");
		const res = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: loginUsername,
				password: loginPassword,
			}),
		});
		const data = await res.json();
		setLoginMessage(data.message || data.error || "Something went wrong");
		if (res.ok) {
			setLoginUsername("");
			setLoginPassword("");
			// Optionally redirect
			window.location.href = "/profile";
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold text-center mb-8">
				Movie Review App
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="border p-4 rounded">
					<h2 className="text-xl font-semibold mb-4">Register</h2>
					<form onSubmit={handleRegister}>
						<div className="mb-4">
							<label className="block text-sm font-medium mb-1">
								Username
							</label>
							<input
								type="text"
								value={regUsername}
								onChange={(e) => setRegUsername(e.target.value)}
								className="w-full p-2 border rounded"
								required
							/>
						</div>
						<div className="mb-4">
							<label className="block text-sm font-medium mb-1">
								Password
							</label>
							<input
								type="password"
								value={regPassword}
								onChange={(e) => setRegPassword(e.target.value)}
								className="w-full p-2 border rounded"
								required
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-green-500 text-white p-2 rounded">
							Register
						</button>
					</form>
					{regMessage && (
						<p className="mt-4 text-center">{regMessage}</p>
					)}
				</div>
				<div className="border p-4 rounded">
					<h2 className="text-xl font-semibold mb-4">Login</h2>
					<form onSubmit={handleLogin}>
						<div className="mb-4">
							<label className="block text-sm font-medium mb-1">
								Username
							</label>
							<input
								type="text"
								value={loginUsername}
								onChange={(e) =>
									setLoginUsername(e.target.value)
								}
								className="w-full p-2 border rounded"
								required
							/>
						</div>
						<div className="mb-4">
							<label className="block text-sm font-medium mb-1">
								Password
							</label>
							<input
								type="password"
								value={loginPassword}
								onChange={(e) =>
									setLoginPassword(e.target.value)
								}
								className="w-full p-2 border rounded"
								required
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-blue-500 text-white p-2 rounded">
							Login
						</button>
					</form>
					{loginMessage && (
						<p className="mt-4 text-center">{loginMessage}</p>
					)}
				</div>
			</div>
		</div>
	);
}
