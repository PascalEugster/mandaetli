import { NextResponse } from "next/server";
import { addToWatchlist, getOrCreateWatchlist, removeFromWatchlist } from "@/lib/data/watchlist";

export async function POST(request: Request) {
	const body = await request.json();
	const { email, actorId } = body as { email?: string; actorId?: string };

	if (!email || !actorId) {
		return NextResponse.json({ error: "email and actorId required" }, { status: 400 });
	}

	// Basic email validation
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return NextResponse.json({ error: "Invalid email" }, { status: 400 });
	}

	try {
		const token = await getOrCreateWatchlist(email);
		const success = await addToWatchlist(token, actorId);

		if (!success) {
			return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
		}

		// In production, this would send a confirmation email
		// For mock data mode, we log and return the management URL
		console.log(`[Watchlist] ${email} is now watching actor ${actorId}. Token: ${token}`);

		return NextResponse.json({
			token,
			managementUrl: `/watchlist/${token}`,
		});
	} catch (error) {
		console.error("[Watchlist] Error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	const body = await request.json();
	const { token, actorId } = body as { token?: string; actorId?: string };

	if (!token || !actorId) {
		return NextResponse.json({ error: "token and actorId required" }, { status: 400 });
	}

	try {
		const success = await removeFromWatchlist(token, actorId);

		if (!success) {
			return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Watchlist] Error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
