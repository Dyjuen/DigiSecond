import { PrismaClient, ListingType, ListingStatus, UserRole, TransactionStatus, PaymentMethod, PaymentStatus, DisputeCategory, DisputeStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting comprehensive seeding...");

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

    console.log("📁 Creating categories...");
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: { name: cat.name, slug: cat.slug },
        });
    }

    console.log("👤 Creating users...");
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
            phone: "08123456789",
            id_card_url: "https://assets.digisecond.com/mock-ktp.jpg",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        },
    });

    const seller2 = await prisma.user.upsert({
        where: { email: "seller2@example.com" },
        update: {},
        create: {
            email: "seller2@example.com",
            name: "ProGamer Shop",
            role: UserRole.SELLER,
            is_verified: true,
            rating: 4.5,
            rating_count: 89,
            phone: "08567891234",
            id_card_url: "https://assets.digisecond.com/mock-ktp2.jpg",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer",
        },
    });

    const buyer = await prisma.user.upsert({
        where: { email: "buyer@example.com" },
        update: {},
        create: {
            email: "buyer@example.com",
            name: "John Buyer",
            role: UserRole.BUYER,
            phone: "08234567890",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        },
    });

    const buyer2 = await prisma.user.upsert({
        where: { email: "buyer2@example.com" },
        update: {},
        create: {
            email: "buyer2@example.com",
            name: "Jane Gamer",
            role: UserRole.BUYER,
            phone: "08345678901",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
        },
    });

    const admin = await prisma.user.upsert({
        where: { email: "admin@digisecond.com" },
        update: {},
        create: {
            email: "admin@digisecond.com",
            name: "Super Admin",
            role: UserRole.ADMIN,
            is_verified: true,
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        },
    });

    const mlCategory = await prisma.category.findUnique({ where: { slug: "mobile-legends" } });
    const valCategory = await prisma.category.findUnique({ where: { slug: "valorant" } });
    const giCategory = await prisma.category.findUnique({ where: { slug: "genshin-impact" } });
    const ffCategory = await prisma.category.findUnique({ where: { slug: "free-fire" } });
    const steamCategory = await prisma.category.findUnique({ where: { slug: "steam" } });

    if (!mlCategory || !valCategory || !giCategory || !ffCategory || !steamCategory) {
        console.error("Categories not found, skipping listings creation");
        return;
    }

    console.log("📦 Creating listings...");

    const auctionListing1 = await prisma.listing.create({
        data: {
            title: "Akun MLBB Sultan Full Skin Legend",
            description: "Akun Mobile Legends Sultan, semua skin Legend ada, Mythical Glory. Termasuk 50+ skin epic, 20+ skin legend, starlight member aktif. Win rate 70%+, koleksi emblem maxed.",
            price: 5000000,
            category_id: mlCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.AUCTION,
            status: ListingStatus.ACTIVE,
            view_count: 1250,
            starting_bid: 2000000,
            current_bid: 3500000,
            bid_increment: 100000,
            auction_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        },
    });

    const auctionListing2 = await prisma.listing.create({
        data: {
            title: "Valorant Account Radiant Gun Buddy",
            description: "Akun Valorant ex-Radiant, ada gun buddy episode 5, skin Vandal Prime, Phantom Spectrum, Operator Elderflame. 200+ skins total.",
            price: 1000000,
            category_id: valCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.AUCTION,
            status: ListingStatus.ACTIVE,
            view_count: 850,
            starting_bid: 500000,
            current_bid: 800000,
            bid_increment: 50000,
            auction_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 5),
        },
    });

    const fixedListing1 = await prisma.listing.create({
        data: {
            title: "Jasa Joki Genshin Impact Murah",
            description: "Jasa joki eksplorasi 100% region Fontaine & Sumeru. Termasuk quest utama, side quest, dan all chests. Dikerjakan dalam 3-5 hari.",
            price: 150000,
            category_id: giCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.ACTIVE,
            view_count: 320,
        },
    });

    const fixedListing2 = await prisma.listing.create({
        data: {
            title: "Akun Smurf Mobile Legends Epic",
            description: "Akun smurf cocok untuk latihan hero, rank Epic V. Ada 30+ hero, 10+ skin. Emblem sudah level 40+.",
            price: 50000,
            category_id: mlCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.ACTIVE,
            view_count: 120,
        },
    });

    const fixedListing3 = await prisma.listing.create({
        data: {
            title: "Akun Free Fire Sultan Full Bundle",
            description: "Akun Free Fire dengan semua bundle legendary, diamond pass aktif, 50+ gun skin. Level 80+.",
            price: 750000,
            category_id: ffCategory.category_id,
            seller_id: seller2.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.ACTIVE,
            view_count: 450,
        },
    });

    const fixedListing4 = await prisma.listing.create({
        data: {
            title: "Steam Account 200+ Games",
            description: "Akun Steam dengan 200+ games termasuk AAA titles. Level 50+, banyak badge dan profile items.",
            price: 2500000,
            category_id: steamCategory.category_id,
            seller_id: seller2.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.ACTIVE,
            view_count: 678,
        },
    });

    const soldListing = await prisma.listing.create({
        data: {
            title: "Akun Genshin AR 55 Full Character",
            description: "Akun Genshin Impact AR 55, semua 5-star character limited ada. Hutao C1, Raiden C2, Ayaka C0. Weapon: Homa, Engulfing Lightning.",
            price: 3000000,
            category_id: giCategory.category_id,
            seller_id: seller.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.SOLD,
            view_count: 890,
        },
    });

    console.log("🔨 Creating bids...");
    await prisma.bid.createMany({
        data: [
            { listing_id: auctionListing1.listing_id, bidder_id: buyer.user_id, bid_amount: 2500000 },
            { listing_id: auctionListing1.listing_id, bidder_id: buyer2.user_id, bid_amount: 3000000 },
            { listing_id: auctionListing1.listing_id, bidder_id: buyer.user_id, bid_amount: 3500000 },
            { listing_id: auctionListing2.listing_id, bidder_id: buyer2.user_id, bid_amount: 600000 },
            { listing_id: auctionListing2.listing_id, bidder_id: buyer.user_id, bid_amount: 800000 },
        ],
    });

    console.log("💰 Creating transactions...");

    const completedTransaction = await prisma.transaction.create({
        data: {
            listing_id: soldListing.listing_id,
            buyer_id: buyer.user_id,
            seller_id: seller.user_id,
            transaction_amount: 3000000,
            platform_fee_amount: 150000,
            seller_payout_amount: 2850000,
            status: TransactionStatus.COMPLETED,
            completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
            item_transferred_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        },
    });

    const pendingListing = await prisma.listing.create({
        data: {
            title: "Akun MLBB Mythic Glory Season 30",
            description: "Akun Mobile Legends Mythic Glory, 100+ skin, 80+ hero. Win rate 65%.",
            price: 800000,
            category_id: mlCategory.category_id,
            seller_id: seller2.user_id,
            listing_type: ListingType.FIXED,
            status: ListingStatus.SOLD,
            view_count: 234,
        },
    });

    const pendingTransaction = await prisma.transaction.create({
        data: {
            listing_id: pendingListing.listing_id,
            buyer_id: buyer2.user_id,
            seller_id: seller2.user_id,
            transaction_amount: 800000,
            platform_fee_amount: 40000,
            seller_payout_amount: 760000,
            status: TransactionStatus.PAID,
            verification_deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        },
    });

    console.log("💳 Creating payments...");
    await prisma.payment.create({
        data: {
            transaction_id: completedTransaction.transaction_id,
            xendit_payment_id: "inv_" + Date.now() + "_completed",
            payment_method: PaymentMethod.VA,
            payment_amount: 3000000,
            status: PaymentStatus.PAID,
            paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        },
    });

    await prisma.payment.create({
        data: {
            transaction_id: pendingTransaction.transaction_id,
            xendit_payment_id: "inv_" + Date.now() + "_pending",
            payment_method: PaymentMethod.QRIS,
            payment_amount: 800000,
            status: PaymentStatus.PAID,
            paid_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
    });

    console.log("💬 Creating messages...");
    await prisma.message.createMany({
        data: [
            {
                transaction_id: completedTransaction.transaction_id,
                sender_user_id: buyer.user_id,
                message_content: "Halo kak, pembayaran sudah saya lakukan ya",
                is_read: true,
            },
            {
                transaction_id: completedTransaction.transaction_id,
                sender_user_id: seller.user_id,
                message_content: "Baik kak, terima kasih. Saya siapkan data akunnya dulu ya",
                is_read: true,
            },
            {
                transaction_id: completedTransaction.transaction_id,
                sender_user_id: seller.user_id,
                message_content: "Data akun sudah saya kirim via chat ini. Email: xxx, Password: xxx. Silakan dicek dulu kak",
                is_read: true,
            },
            {
                transaction_id: completedTransaction.transaction_id,
                sender_user_id: buyer.user_id,
                message_content: "Sudah saya cek kak, semua sesuai deskripsi. Terima kasih banyak!",
                is_read: true,
            },
            {
                transaction_id: pendingTransaction.transaction_id,
                sender_user_id: buyer2.user_id,
                message_content: "Kak, pembayaran sudah berhasil. Mohon segera dikirim datanya ya",
                is_read: true,
            },
            {
                transaction_id: pendingTransaction.transaction_id,
                sender_user_id: seller2.user_id,
                message_content: "Siap kak, saya kirim dalam 1 jam ya. Mohon ditunggu",
                is_read: false,
            },
        ],
    });

    console.log("⭐ Creating reviews...");
    await prisma.review.createMany({
        data: [
            {
                transaction_id: completedTransaction.transaction_id,
                reviewer_user_id: buyer.user_id,
                reviewed_user_id: seller.user_id,
                rating_score: 5,
                review_comment: "Seller sangat responsif dan akun sesuai deskripsi. Proses cepat dan aman. Recommended!",
            },
            {
                transaction_id: completedTransaction.transaction_id,
                reviewer_user_id: seller.user_id,
                reviewed_user_id: buyer.user_id,
                rating_score: 5,
                review_comment: "Buyer kooperatif, pembayaran cepat. Terima kasih sudah belanja!",
            },
        ],
    });

    console.log("🏦 Creating payouts...");
    await prisma.payout.create({
        data: {
            transaction_id: completedTransaction.transaction_id,
            seller_id: seller.user_id,
            payout_amount: 2850000,
            bank_code: "BCA",
            bank_name: "Bank Central Asia",
            account_number: "1234567890",
            account_holder_name: "Sultan Gaming",
            status: "COMPLETED",
            processed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            bank_reference: "TRF" + Date.now(),
        },
    });

    console.log("🔔 Creating notifications...");
    await prisma.notification.createMany({
        data: [
            {
                user_id: seller.user_id,
                notification_type: "PAYMENT_RECEIVED",
                title: "Pembayaran Diterima",
                body: "Pembayaran untuk Akun Genshin AR 55 sebesar Rp 3.000.000 telah diterima",
                is_read: true,
            },
            {
                user_id: seller.user_id,
                notification_type: "PAYOUT_COMPLETED",
                title: "Payout Berhasil",
                body: "Dana sebesar Rp 2.850.000 telah ditransfer ke rekening BCA Anda",
                is_read: true,
            },
            {
                user_id: buyer.user_id,
                notification_type: "REVIEW_RECEIVED",
                title: "Review Baru",
                body: "Anda menerima review positif dari Sultan Gaming",
                is_read: false,
            },
            {
                user_id: seller2.user_id,
                notification_type: "PAYMENT_RECEIVED",
                title: "Pembayaran Diterima",
                body: "Pembayaran untuk Akun MLBB Mythic Glory sebesar Rp 800.000 telah diterima",
                is_read: false,
            },
        ],
    });

    console.log("🏧 Creating bank accounts...");
    await prisma.bankAccount.upsert({
        where: { bank_account_id: "default-bank" },
        update: {},
        create: {
            bank_account_id: "default-bank",
            user_id: seller.user_id,
            bank_code: "BCA",
            bank_name: "Bank Central Asia",
            account_number: "1234567890",
            account_holder_name: "Sultan Gaming",
            is_default: true,
            is_verified: true,
        },
    });

    console.log("✅ Comprehensive seeding finished!");
    console.log("");
    console.log("📊 Summary:");
    console.log("   - 10 Categories");
    console.log("   - 5 Users (2 sellers, 2 buyers, 1 admin)");
    console.log("   - 8 Listings (2 auction, 6 fixed)");
    console.log("   - 5 Bids");
    console.log("   - 2 Transactions (1 completed, 1 in-progress)");
    console.log("   - 2 Payments");
    console.log("   - 6 Messages");
    console.log("   - 2 Reviews");
    console.log("   - 1 Payout");
    console.log("   - 4 Notifications");
    console.log("   - 1 Bank Account");
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