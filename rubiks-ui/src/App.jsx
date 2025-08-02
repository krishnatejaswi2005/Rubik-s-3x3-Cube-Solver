import { useState } from "react";

const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];
const COLOR_MAP = {
	white: "#f8f9fa",
	yellow: "#ffe066",
	red: "#ff6b6b",
	orange: "#ff9f43",
	blue: "#4dabf7",
	green: "#51cf66",
	default: "#dee2e6",
};

function Face({ stickers, title }) {
	return (
		<div className="m-2" style={{ minWidth: 120 }}>
			<div className="text-uppercase fw-semibold small text-center mb-1">
				{title}
			</div>
			<div
				className="d-grid gap-1"
				style={{ gridTemplateColumns: "repeat(3, 40px)", display: "grid" }}
			>
				{stickers.map((c, i) => (
					<div
						key={i}
						aria-label={c}
						title={c}
						style={{
							width: 36,
							height: 36,
							backgroundColor: COLOR_MAP[c] || COLOR_MAP.default,
							border: "1px solid #adb5bd",
							borderRadius: 6,
							boxSizing: "border-box",
						}}
					/>
				))}
			</div>
		</div>
	);
}

export default function App() {
	const [scramble, setScramble] = useState("");
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const solve = async () => {
		setLoading(true);
		try {
			const resp = await fetch("http://localhost:5000/solve", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ scramble: scramble || undefined }),
			});
			const data = await resp.json();
			setResult(data);
		} catch (e) {
			console.error(e);
			alert("Failed to solve. See console for details.");
		} finally {
			setLoading(false);
		}
	};

	const reset = () => {
		setScramble("");
		setResult(null);
	};

	return (
		<div
			className="container py-5"
			style={{
				fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
			}}
		>
			<div className="mb-4 text-center">
				<h1 className="fw-bold">Rubik’s Cube Solver</h1>
				<p className="text-muted mb-0">
					Input a scramble or leave blank for a random one. Powered by PyCuber +
					Kociemba.
				</p>
			</div>

			<div className="row g-3 mb-5 justify-content-center">
				<div className="col-md-8">
					<div className="input-group shadow-sm">
						<input
							aria-label="Scramble"
							placeholder="e.g. R U R' U' or leave empty"
							value={scramble}
							onChange={(e) => setScramble(e.target.value)}
							className="form-control"
						/>
						<button
							className="btn btn-primary"
							onClick={solve}
							disabled={loading}
						>
							{loading ? (
								<>
									<span
										className="spinner-border spinner-border-sm me-2"
										role="status"
										aria-hidden="true"
									/>
									Solving...
								</>
							) : (
								"Solve"
							)}
						</button>
					</div>
					<div className="form-text">Standard notation; spaces optional.</div>
				</div>
				<div className="col-auto">
					<button className="btn btn-outline-secondary" onClick={reset}>
						Reset
					</button>
				</div>
			</div>

			{result ? (
				<div className="row gy-4">
					<div className="col-lg-6">
						<div className="card shadow-sm mb-4">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-3">
									<div>
										<h5 className="card-title mb-1">Scrambled Cube</h5>
										<div className="text-muted small">
											Input:{" "}
											<code className="bg-light px-1 rounded">
												{result.scramble}
											</code>
										</div>
									</div>
								</div>
								<div className="d-flex flex-wrap">
									{FACE_ORDER.map((f) => (
										<Face key={f} stickers={result.pre_state[f]} title={f} />
									))}
								</div>
							</div>
						</div>

						<div className="card shadow-sm">
							<div className="card-body">
								<h5 className="card-title mb-2">Solution</h5>
								<p className="mb-0">
									<code className="p-2 d-block bg-light rounded">
										{result.solution}
									</code>
								</p>
							</div>
						</div>
					</div>

					<div className="col-lg-6">
						<div className="card shadow-sm mb-4">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-start mb-3">
									<div>
										<h5 className="card-title mb-1">After Applying</h5>
										<div className="text-muted small">Resulting cube state</div>
									</div>
									<div
										className={`badge ${
											result.solved ? "bg-success" : "bg-danger"
										} py-2`}
									>
										{result.solved ? "Solved ✓" : "Not Solved ✕"}
									</div>
								</div>
								<div className="d-flex flex-wrap">
									{FACE_ORDER.map((f) => (
										<Face key={f} stickers={result.post_state[f]} title={f} />
									))}
								</div>
							</div>
						</div>

						<div className="card shadow-sm">
							<div className="card-body d-flex justify-content-between align-items-center">
								<div className="small text-muted">
									Try a new scramble or clear current.
								</div>
								<button
									className="btn btn-sm btn-outline-secondary"
									onClick={reset}
								>
									New
								</button>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="text-center text-secondary mt-5">
					<p className="mb-1">No scramble solved yet.</p>
					<small>Enter a scramble and press Solve to visualize.</small>
				</div>
			)}
		</div>
	);
}
