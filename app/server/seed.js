/**
 * Seed script — demo members, image posts, and chat history.
 *
 * Run inside Docker:  docker compose exec server node seed.js
 * Run on the host:    node app/server/seed.js
 *
 * Idempotent: every document it writes is tagged { seeded: true } and any
 * previously seeded documents are removed first, so re-running is safe.
 */
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

const DB_URL = process.env.DB_URL || "mongodb://localhost:27017";
const DATABASE = process.env.DATABASE || "Instagram";

// Match db.js: some ISPs refuse SRV lookups, which breaks mongodb+srv:// URLs.
// Only applied to SRV connection strings so private/internal DNS still works.
if (DB_URL.startsWith("mongodb+srv://") && process.env.DNS_OVERRIDE !== "off") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}
const DEMO_PASSWORD = "Password123!";

const MEMBERS = [
  { firstName: "Aarav",  lastName: "Mehta",    email: "aarav.mehta@demo.com",   avatarId: 12, bio: "Product designer. Coffee first, pixels second." },
  { firstName: "Priya",  lastName: "Raman",    email: "priya.raman@demo.com",   avatarId: 45, bio: "Travel photographer chasing golden hour." },
  { firstName: "Kabir",  lastName: "Shah",     email: "kabir.shah@demo.com",    avatarId: 33, bio: "Backend dev. I speak fluent JSON." },
  { firstName: "Meera",  lastName: "Iyer",     email: "meera.iyer@demo.com",    avatarId: 26, bio: "Illustrator & plant hoarder 🌿" },
  { firstName: "Rohan",  lastName: "Verma",    email: "rohan.verma@demo.com",   avatarId: 51, bio: "Trail runner. Mountains > meetings." },
  { firstName: "Ananya", lastName: "Krishnan", email: "ananya.k@demo.com",      avatarId: 9,  bio: "Food writer documenting street eats." },
];

const POSTS = [
  { author: 1, slug: "sunrise-ridge",  caption: "Caught the sunrise from the ridge this morning. Worth every step of the 4am start. ⛰️" },
  { author: 5, slug: "street-noodles", caption: "Best bowl of noodles I've had all year — and it cost less than a coffee." },
  { author: 3, slug: "studio-desk",    caption: "Reorganised the studio. New light, new energy, same chaos." },
  { author: 0, slug: "ui-sketches",    caption: "Early sketches for a soft UI concept. Shadows are doing all the heavy lifting here." },
  { author: 4, slug: "forest-trail",   caption: "12km through the pines. The forest is the only place my head goes quiet." },
  { author: 1, slug: "harbour-dusk",   caption: "Harbour at dusk. The light lasted about ninety seconds." },
  { author: 2, slug: "code-latenight", caption: "Shipped the migration at 2am. The build is green and so am I." },
  { author: 3, slug: "ceramics",       caption: "First attempt at ceramics. It's lopsided and I love it." },
];

const CONVERSATIONS = [
  { member: 0, lines: [["them", "Hey! Saw your last post — that layout is clean 👏"], ["me", "Thanks! Still tweaking the spacing."], ["them", "Happy to review it if you want a second pair of eyes."]] },
  { member: 1, lines: [["them", "Are you around this weekend? Planning a shoot at the harbour."], ["me", "Should be! What time?"], ["them", "Golden hour, ~6pm. Bring the wide lens."]] },
  { member: 2, lines: [["them", "Did the deploy go through?"], ["me", "Yep, green across the board."], ["them", "Legend. I'll close the ticket."]] },
];

const img = (slug) => `https://picsum.photos/seed/${slug}/900/700`;
const avatar = (id) => `https://i.pravatar.cc/300?img=${id}`;
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const minsAgo = (n) => new Date(Date.now() - n * 60000).toISOString();

const run = async () => {
  const client = new MongoClient(DB_URL);
  await client.connect();
  const db = client.db(DATABASE);
  console.log(`Connected to ${DATABASE}`);

  // --- Clean previous seed data (idempotent) ---
  for (const c of ["users", "posts", "messages", "notifications", "follows"]) {
    const { deletedCount } = await db.collection(c).deleteMany({ seeded: true });
    if (deletedCount) console.log(`  cleared ${deletedCount} seeded doc(s) from ${c}`);
  }

  // --- Members ---
  const hash = await bcrypt.hash(DEMO_PASSWORD, await bcrypt.genSalt(10));
  const memberDocs = MEMBERS.map((m) => ({
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email,
    password: hash,
    avatar: avatar(m.avatarId),
    bio: m.bio,
    createdAt: daysAgo(30),
    seeded: true,
  }));
  // Remove any non-seeded leftovers with the same emails to avoid duplicates.
  await db.collection("users").deleteMany({ email: { $in: MEMBERS.map((m) => m.email) } });
  const { insertedIds } = await db.collection("users").insertMany(memberDocs);
  const memberIds = Object.values(insertedIds).map((id) => id.toString());
  console.log(`Seeded ${memberIds.length} members (password: ${DEMO_PASSWORD})`);

  // --- Posts with images ---
  const postDocs = POSTS.map((p, i) => {
    const m = MEMBERS[p.author];
    return {
      caption: p.caption,
      image: img(p.slug),
      authorName: `${m.firstName} ${m.lastName}`,
      authorId: m.email,
      userId: memberIds[p.author],
      likes: memberIds.filter((_, idx) => idx !== p.author).slice(0, (i % 4) + 1),
      comments: [],
      createdAt: daysAgo(i),
      seeded: true,
    };
  });
  await db.collection("posts").insertMany(postDocs);
  console.log(`Seeded ${postDocs.length} posts with images`);

  // --- Chat history with every real (non-seeded) account ---
  const realUsers = await db
    .collection("users")
    .find({ seeded: { $ne: true } })
    .toArray();

  if (realUsers.length === 0) {
    console.log("No real accounts found — skipping chat seeding.");
    console.log("   Register an account, then re-run this script to populate chats.");
  } else {
    const messages = [];
    for (const user of realUsers) {
      const uid = user._id.toString();
      CONVERSATIONS.forEach((convo, ci) => {
        const memberId = memberIds[convo.member];
        convo.lines.forEach(([who, text], li) => {
          messages.push({
            senderId: who === "me" ? uid : memberId,
            recipientId: who === "me" ? memberId : uid,
            text,
            senderName:
              who === "me"
                ? `${user.firstName || "You"} ${user.lastName || ""}`.trim()
                : `${MEMBERS[convo.member].firstName} ${MEMBERS[convo.member].lastName}`,
            createdAt: minsAgo((CONVERSATIONS.length - ci) * 60 - li * 5),
            seeded: true,
          });
        });
      });
    }
    await db.collection("messages").insertMany(messages);
    console.log(`Seeded ${messages.length} messages across ${realUsers.length} account(s)`);
  }

  await client.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
