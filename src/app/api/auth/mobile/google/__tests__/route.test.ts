import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

// Mock dependencies
vi.mock("@/server/db", () => ({
    db: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock("google-auth-library", () => ({
    OAuth2Client: vi.fn().mockImplementation(() => ({
        verifyIdToken: vi.fn().mockResolvedValue({
            getPayload: () => ({
                email: "test@example.com",
                name: "Test User",
                picture: "https://example.com/avatar.jpg",
                sub: "google-id-123",
            }),
        }),
    })),
}));

describe("Mobile Google Auth Endpoint", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 if accessToken is missing", async () => {
        const req = new Request("http://localhost/api/auth/mobile/google", {
            method: "POST",
            body: JSON.stringify({}),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });
});
