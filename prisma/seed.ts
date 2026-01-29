
import { PrismaClient, ListingType, ListingStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seeding...");

    // 1. Create Categories
    const categories = [
        { name: "Mobile Legends", slug: "mobile-legends" },
        { name: "Free Fire", slug: "free-fire" },
        { name: "PUBG Mobile", slug: "pubg-mobile" },
        { name: "Genshin Impact", slug: "genshin-impact" },
        { name: "Valorant", slug: "valorant" },
        { name: "Roblox", slug: "roblox" },
        { name: "Steam", slug: "steam" },
        { name: "PlayStation", slug: "playstation" },
        { name: "Nintendo", slug: "nintendo" },
        { name: "Lainnya", slug: "other" },
    ];

    console.log("Creating categories...");
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
            },
        });
    }

    // 2. Create Users
    console.log("Creating users...");
    const seller = await prisma.user.upsert({
        where: { email: "seller@example.com" },
        update: {},
        create: {
            email: "seller@example.com",
            name: "Sultan Gaming",
            role: UserRole.SELLER,
            is_verified: true,
            rating: 4.8,
            rating_count: 150,
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        },
    });

    const buyer = await prisma.user.upsert({
        where: { email: "buyer@example.com" },
        update: {},
        create: {
            email: "buyer@example.com",
            name: "John Buyer",
            role: UserRole.BUYER,
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        },
    });

    const admin = await prisma.user.upsert({
        where: { email: "admin@digisecond.com" },
        update: {},
        create: {
            email: "admin@digisecond.com",
            name: "Super Admin",
            role: UserRole.ADMIN,
            // In a real app, hash this password! For now we use exact string match or pre-hashed
            // allowing "admin123" to be the password.
            // We will handle the "password_hash" field check in auth.ts
            // You might need to add `password_hash` to your schema if not present,
            // OR use a fixed string comparison in CredentialsProvider for this specific email.
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        },
    });

    // 3. Create Listings
    console.log("Creating listings...");

    const mlCategory = await prisma.category.findUnique({ where: { slug: "mobile-legends" } });
    const valCategory = await prisma.category.findUnique({ where: { slug: "valorant" } });
    const giCategory = await prisma.category.findUnique({ where: { slug: "genshin-impact" } });

    if (!mlCategory || !valCategory || !giCategory) {
        console.error("Categories not found, skipping listings creation");
        return;
    }

    // Auction Listings
    await prisma.listing.create({
        data: {
            title: "Akun MLBB Sultan Full Skin Legend",
            description: "Akun Mobile Legends Sultan, semua skin Legend ada, Mythical Glory.",
            price: 5000000,
            category_id: mlCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.AUCTION,
            status: ListingStatus.ACTIVE,
            view_count: 1250,
            starting_bid: 2000000,
            current_bid: 3500000,
            auction_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
        },
    });

    await prisma.listing.create({
        data: {
            title: "Valorant Account Radiant Gun Buddy",
            description: "Akun Valorant ex-Radiant, ada gun buddy episode 5, skin Vandal Prime.",
            price: 1000000,
            category_id: valCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.AUCTION,
            status: ListingStatus.ACTIVE,
            view_count: 850,
            starting_bid: 500000,
            current_bid: 800000,
            auction_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
        },
    });

    // Fixed Price Listings
    await prisma.listing.create({
        data: {
            title: "Jasa Joki Genshin Impact Murah",
            description: "Jasa joki eksplorasi 100% region Fontaine & Sumeru.",
            price: 150000,
            category_id: giCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.ACTIVE,
            view_count: 320,
        },
    });

    await prisma.listing.create({
        data: {
            title: "Akun Smurf Mobile Legends Epic",
            description: "Akun smurf cocok untuk latihan hero, rank Epic V.",
            price: 50000,
            category_id: mlCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.ACTIVE,
            view_count: 120,
        },
    });

    console.log("✅ Seeding finished.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
