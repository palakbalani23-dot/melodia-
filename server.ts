import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up directories
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// File paths
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SONGS_FILE = path.join(DATA_DIR, "songs.json");
const PLAYLISTS_FILE = path.join(DATA_DIR, "playlists.json");

// JWT Config
const JWT_SECRET = process.env.JWT_SECRET || "melodia-secret-jwt-key-2026-xyz";

// Helper for JWT Creation
function signToken(payload: any): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Helper for JWT Verification
function verifyToken(token: string): any {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch (e) {
    return null;
  }
}

// Password Hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Seed Initial Data
const SEED_SONGS = [
  {
    id: "song-1",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    genre: "Pop",
    duration: 178,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a",
    coverUrl: "/uploads/taylor_swift_song_cover.jpg",
    isCustomUpload: false
  },
  {
    id: "song-2",
    title: "Blank Space",
    artist: "Taylor Swift",
    genre: "Pop",
    duration: 231,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/79/55/b1/7955b10c-6cb6-462a-861c-8e5cbcacfb76/mzaf_3395570742482345989.plus.aac.p.m4a",
    coverUrl: "/uploads/blank_space_cover.jpg",
    isCustomUpload: false
  },
  {
    id: "song-3",
    title: "Lover",
    artist: "Taylor Swift",
    genre: "Pop",
    duration: 221,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e0/db/47/e0db47b0-7f70-0631-0414-cd4777d2fb3e/mzaf_6362891154838442638.plus.aac.p.m4a",
    coverUrl: "/uploads/lover_cover.jpg",
    isCustomUpload: false
  },
  {
    id: "song-4",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    genre: "Pop",
    duration: 200,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/56/2a/1d562a07-dc5f-a9c0-1f36-2051a8c14eb7/mzaf_7214829135431340590.plus.aac.p.m4a",
    coverUrl: "/uploads/anti_hero_cover.jpg",
    isCustomUpload: false
  },
  {
    id: "song-5",
    title: "Bad Guy",
    artist: "Billie Eilish",
    genre: "Pop/Alternative",
    duration: 194,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/87/1f/c3871f7e-3260-d615-1c66-5fdca2c3a48f/mzaf_10721331211699880949.plus.aac.p.m4a",
    coverUrl: "/uploads/bad_guy_cover.jpg",
    isCustomUpload: false
  },
  {
    id: "song-6",
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    genre: "Alternative/Indie",
    duration: 200,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d6/59/2b/d6592b0b-1e7e-4743-b2e4-f2af038fd783/mzaf_7697277787797935735.plus.aac.p.m4a",
    coverUrl: "/uploads/ocean_eyes_cover.jpg",
    isCustomUpload: false
  },
  {
    id: "song-7",
    title: "Happier Than Ever",
    artist: "Billie Eilish",
    genre: "Alternative/Indie",
    duration: 298,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/8c/6b/20/8c6b203a-cadc-25b3-1c91-2a8e77210e31/mzaf_9684961884676177661.plus.aac.p.m4a",
    coverUrl: "/uploads/happier_cover.jpg",
    isCustomUpload: false
  },
  {
    id: "song-8",
    title: "Neon City Lights",
    artist: "Synthwave Echo",
    genre: "Synthwave",
    duration: 423,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80",
    isCustomUpload: false
  }
];

const SEED_USERS = [
  {
    id: "user-1",
    email: "user@melodia.com",
    name: "Alex Listener",
    passwordHash: hashPassword("password"),
    role: "user",
    likedSongs: ["song-1", "song-3"],
    avatarUrl: ""
  },
  {
    id: "user-2",
    email: "admin@melodia.com",
    name: "Sarah Curator (Admin)",
    passwordHash: hashPassword("password"),
    role: "admin",
    likedSongs: ["song-2"],
    avatarUrl: ""
  },
  {
    id: "user-palak",
    email: "palakbalani23@gmail.com",
    name: "Palak Balani (Curator)",
    passwordHash: hashPassword("password"),
    role: "admin",
    likedSongs: ["song-1", "song-2", "song-3", "song-5"],
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
  }
];

const SEED_PLAYLISTS = [
  {
    id: "playlist-1",
    name: "Late Night Study Essentials",
    description: "Relaxing lofi & ambient beats to help you focus and study deeply.",
    songs: ["song-1", "song-3", "song-5"],
    createdBy: "system",
    creatorName: "Melodia Curators",
    isPublic: true,
    coverUrl: "/uploads/starlight_dreams_simple.jpg"
  },
  {
    id: "playlist-2",
    name: "Synthwave Retro Drive",
    description: "Cruising through the digital night with up-beat synthwave rhythms.",
    songs: ["song-2", "song-4"],
    createdBy: "system",
    creatorName: "Melodia Curators",
    isPublic: true,
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80"
  }
];

// Initialize JSON Data Files
function loadJSON(filePath: string, defaultData: any) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error("Error reading JSON file, resetting to default:", filePath, e);
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

let usersList = loadJSON(USERS_FILE, SEED_USERS);

// Ensure Palak Balani profile is always upserted with curator role & premium profile photo
const palakEmail = "palakbalani23@gmail.com";
let palakUserIndex = usersList.findIndex((u: any) => u.email.toLowerCase() === palakEmail);
if (palakUserIndex === -1) {
  usersList.push({
    id: "user-palak",
    email: palakEmail,
    name: "Palak Balani (Curator)",
    passwordHash: hashPassword("password"),
    role: "admin",
    likedSongs: ["song-1", "song-2", "song-3", "song-5"],
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
  });
  saveUsers();
} else {
  // If exists, make sure role, name, and avatar are properly synced
  usersList[palakUserIndex].role = "admin";
  usersList[palakUserIndex].name = "Palak Balani (Curator)";
  usersList[palakUserIndex].avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80";
  saveUsers();
}

let songsList = loadJSON(SONGS_FILE, SEED_SONGS);
let playlistsList = loadJSON(PLAYLISTS_FILE, SEED_PLAYLISTS);

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2));
}

function saveSongs() {
  fs.writeFileSync(SONGS_FILE, JSON.stringify(songsList, null, 2));
}

function savePlaylists() {
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlistsList, null, 2));
}

// Body parsing configurations
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve custom uploads folder statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is required" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = payload;
  next();
};

// API Routes

// Registration Endpoint
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  const existing = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    passwordHash: hashPassword(password),
    role: role === "admin" ? "admin" : "user", // support optional Admin role
    likedSongs: [],
    avatarUrl: ""
  };

  usersList.push(newUser);
  saveUsers();

  const token = signToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role
  });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      likedSongs: newUser.likedSongs,
      avatarUrl: newUser.avatarUrl || ""
    }
  });
});

// Login Endpoint
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      likedSongs: user.likedSongs,
      avatarUrl: user.avatarUrl || ""
    }
  });
});

// Firebase Authentication Synchronization Endpoint
app.post("/api/auth/firebase-sync", (req, res) => {
  const { uid, email, name, role } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "Firebase UID and Email are required for synchronization." });
  }

  let user = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase() || u.id === uid);
  
  if (!user) {
    user = {
      id: uid,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: role === "admin" || email.toLowerCase() === "admin@melodia.com" ? "admin" : "user",
      likedSongs: [],
      avatarUrl: ""
    };
    usersList.push(user);
    saveUsers();
  } else {
    // Sync attributes if they differ or if migrating seed user id
    if (user.id !== uid) {
      const oldId = user.id;
      user.id = uid;
      // Also update creator references on playlists
      playlistsList.forEach((p: any) => {
        if (p.createdBy === oldId) {
          p.createdBy = uid;
        }
      });
      saveUsers();
      savePlaylists();
    }
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      likedSongs: user.likedSongs || [],
      avatarUrl: user.avatarUrl || ""
    }
  });
});

// Current User profile
app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const user = usersList.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    likedSongs: user.likedSongs || [],
    avatarUrl: user.avatarUrl || ""
  });
});

// Update User Avatar
app.post("/api/auth/me/avatar", authenticateToken, (req: any, res) => {
  const user = usersList.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const { avatarImage } = req.body;
  if (!avatarImage) {
    return res.status(400).json({ error: "No avatar image provided." });
  }

  try {
    if (avatarImage.startsWith("data:image")) {
      const parts = avatarImage.split(";base64,");
      const mime = parts[0].split(":")[1];
      const extension = mime.split("/")[1] || "png";
      const buffer = Buffer.from(parts[1], "base64");
      
      const fileName = `avatar-${user.id}-${Date.now()}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      fs.writeFileSync(filePath, buffer);
      user.avatarUrl = `/uploads/${fileName}`;
      saveUsers();

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        likedSongs: user.likedSongs || [],
        avatarUrl: user.avatarUrl
      });
    } else {
      user.avatarUrl = avatarImage;
      saveUsers();
      
      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        likedSongs: user.likedSongs || [],
        avatarUrl: user.avatarUrl
      });
    }
  } catch (error) {
    console.error("Avatar upload error:", error);
    return res.status(500).json({ error: "Failed to upload avatar image." });
  }
});

// Delete User Avatar
app.delete("/api/auth/me/avatar", authenticateToken, (req: any, res) => {
  const user = usersList.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  try {
    user.avatarUrl = "";
    saveUsers();

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      likedSongs: user.likedSongs || [],
      avatarUrl: ""
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return res.status(500).json({ error: "Failed to delete avatar image." });
  }
});

// Update User Profile Details
app.put("/api/auth/me/profile", authenticateToken, (req: any, res) => {
  const user = usersList.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const { name, email } = req.body;
  
  if (name !== undefined) {
    user.name = name.trim() || user.name;
  }
  
  if (email !== undefined && email.trim() !== "") {
    const checkEmail = email.trim().toLowerCase();
    if (checkEmail !== user.email.toLowerCase()) {
      const emailExists = usersList.some((u: any) => u.email.toLowerCase() === checkEmail && u.id !== user.id);
      if (emailExists) {
        return res.status(400).json({ error: "Email is already taken by another account." });
      }
      user.email = checkEmail;
    }
  }

  saveUsers();

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    likedSongs: user.likedSongs || [],
    avatarUrl: user.avatarUrl || ""
  });
});

// Fetch all songs (with live filters)
app.get("/api/songs", (req, res) => {
  const { query, genre, artist, maxDuration } = req.query;
  let filteredSongs = [...songsList];

  if (query) {
    const term = String(query).toLowerCase();
    filteredSongs = filteredSongs.filter(
      (s: any) =>
        s.title.toLowerCase().includes(term) ||
        s.artist.toLowerCase().includes(term) ||
        s.genre.toLowerCase().includes(term)
    );
  }

  if (genre) {
    filteredSongs = filteredSongs.filter(
      (s: any) => s.genre.toLowerCase() === String(genre).toLowerCase()
    );
  }

  if (artist) {
    filteredSongs = filteredSongs.filter(
      (s: any) => s.artist.toLowerCase() === String(artist).toLowerCase()
    );
  }

  if (maxDuration) {
    const durationLimit = Number(maxDuration);
    if (!isNaN(durationLimit)) {
      filteredSongs = filteredSongs.filter((s: any) => s.duration <= durationLimit);
    }
  }

  res.json(filteredSongs);
});

// Local Pre-Synced Lyrics Database (Offline Fallback)
const LOCAL_LYRICS: Record<string, { time: number; text: string }[]> = {
  "song-1": [
    { time: 0, text: "♪ (Upbeat synth-pop beat intro) ♪" },
    { time: 2, text: "I'm always waiting for you to be waiting below" },
    { time: 6, text: "Devils roll the dice, angels roll their eyes" },
    { time: 9, text: "What doesn't kill me makes me want you more" },
    { time: 13, text: "And it's new, the shape of your body, it's blue" },
    { time: 17, text: "The feeling I've got, and it's ooh, whoa-oh" },
    { time: 20, text: "It's a cruel summer with you!" },
    { time: 24, text: "Hang up my head in the glow of a vending machine" },
    { time: 27, text: "I'm not dying, but I haven't been living..." }
  ],
  "song-2": [
    { time: 0, text: "♪ (Beating drum pattern intro) ♪" },
    { time: 2, text: "So it's gonna be forever" },
    { time: 5, text: "Or it's gonna go down in flames" },
    { time: 8, text: "You can tell me when it's over, mm" },
    { time: 11, text: "If the high was worth the pain" },
    { time: 14, text: "Got a long list of ex-lovers" },
    { time: 17, text: "They'll tell you I'm insane" },
    { time: 21, text: "'Cause you know I love the players" },
    { time: 24, text: "And you love the game!" },
    { time: 27, text: "♪ (Smooth synth beat fade) ♪" }
  ],
  "song-3": [
    { time: 0, text: "♪ (Slow acoustic drums intro) ♪" },
    { time: 2, text: "Can I go where you go?" },
    { time: 5, text: "Can we always be this close forever and ever?" },
    { time: 11, text: "And ah, take me out, and take me home" },
    { time: 16, text: "You're my, my, my, my..." },
    { time: 20, text: "Lover!" },
    { time: 24, text: "We could let our friends crash in the living room" },
    { time: 28, text: "This is my place, I make the rules" }
  ],
  "song-4": [
    { time: 0, text: "♪ (Muted retro drum beats) ♪" },
    { time: 1, text: "It's me, hi, I'm the problem, it's me" },
    { time: 5, text: "At tea time, everybody agrees" },
    { time: 8, text: "I'll stare directly at the sun but never in the mirror" },
    { time: 13, text: "It must be exhausting always rooting for the anti-hero" },
    { time: 19, text: "Sometimes I feel like everybody is a sexy baby" },
    { time: 23, text: "And I'm a monster on the hill" },
    { time: 26, text: "Too big to hang out, slowly lurching..." }
  ],
  "song-5": [
    { time: 0, text: "♪ (Heavy thumping bass and finger snaps) ♪" },
    { time: 2, text: "So you're a tough guy, like it really rough guy" },
    { time: 5, text: "Just can't get enough guy, chest always so puffed guy" },
    { time: 8, text: "I'm that bad type, make your mama sad type" },
    { time: 11, text: "Make your girlfriend mad tight, might seduce your dad type" },
    { time: 14, text: "I'm the bad guy..." },
    { time: 17, text: "...Duh." },
    { time: 19, text: "♪ (Upbeat electronic synthesizer melody) ♪" },
    { time: 25, text: "I'm only good at being bad, bad..." }
  ],
  "song-6": [
    { time: 0, text: "♪ (Soft ambient synthesizer chords) ♪" },
    { time: 2, text: "I've been watching you for some time" },
    { time: 7, text: "Can't stop staring at those ocean eyes" },
    { time: 12, text: "Burning cities and napalm skies" },
    { time: 17, text: "Fifteen flares for twenty-one years" },
    { time: 22, text: "You've got that look in your eyes" },
    { time: 26, text: "Those ocean eyes" },
    { time: 29, text: "♪ (Ethereal echo vocal outro) ♪" }
  ],
  "song-7": [
    { time: 0, text: "♪ (Soft ukulele fingerpicking) ♪" },
    { time: 2, text: "When I'm away from you" },
    { time: 6, text: "I'm happier than ever" },
    { time: 11, text: "Wish I could explain it better" },
    { time: 16, text: "I wish it wasn't true" },
    { time: 21, text: "Give me a day or two to think of something clever" },
    { time: 25, text: "To write myself a letter" },
    { time: 28, text: "To tell me what to do" }
  ],
  "song-8": [
    { time: 0, text: "♪ (Synthesizer Retro Intro) ♪" },
    { time: 5, text: "♪ (Vibrant Synthwave Beats kicking in) ♪" },
    { time: 10, text: "♪ (Smooth analog bassline rolling) ♪" },
    { time: 15, text: "♪ (Neon laser chords echoing in space) ♪" },
    { time: 20, text: "♪ (Uplifting retro-future progression) ♪" },
    { time: 25, text: "♪ (Driving drum pattern pacing forward) ♪" },
    { time: 28, text: "♪ (Vibrant digital sunrise vibes) ♪" }
  ]
};

let aiInstance: GoogleGenAI | null = null;
function getGeminiAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

function generateGenericLyrics(title: string, artist: string) {
  return [
    { time: 0, text: `♪ (Playing "${title}" by ${artist}) ♪` },
    { time: 4, text: "Welcome to Melodia, your personal music oasis" },
    { time: 8, text: "Sit back and enjoy the incredible melodies" },
    { time: 13, text: "Let the sound waves carry you away" },
    { time: 18, text: "Every beat, a heartbeat; every note, a memory" },
    { time: 24, text: "Thank you for listening to this beautiful tune" },
    { time: 30, text: "♪ (Enjoying the smooth vibes) ♪" }
  ];
}

// Fetch Lyrics endpoint
app.get("/api/lyrics", async (req, res) => {
  const { songId, title, artist } = req.query;

  // 1. Check local pre-synced lyrics database first
  if (songId && LOCAL_LYRICS[String(songId)]) {
    return res.json({
      songId: String(songId),
      lyrics: LOCAL_LYRICS[String(songId)],
      isSynced: true,
      source: "local"
    });
  }

  // 2. Try to find the song in the songsList if songId is provided but not in local lyrics
  let finalTitle = title ? String(title) : "";
  let finalArtist = artist ? String(artist) : "";

  if (songId) {
    const song = songsList.find((s: any) => s.id === String(songId));
    if (song) {
      finalTitle = song.title;
      finalArtist = song.artist;
    }
  }

  if (!finalTitle) {
    return res.status(400).json({ error: "Song title is required to fetch lyrics." });
  }

  // 3. Call Gemini API to fetch/generate lyrics
  try {
    const ai = getGeminiAI();
    const prompt = `You are an expert music lyrics finder and synchronizer.
Generate highly accurate synchronized, line-by-line lyrics for the song: "${finalTitle}" by "${finalArtist}".
Since the user is listening to this song in our music player, we need timestamp tags indicating when each line is sung (in seconds, relative to the starting point of the song).
Ensure:
1. Timestamps MUST be in increasing order, starting at 0.
2. Timestamps must be realistic for when each line is actually sung in the real song, or reasonably spaced if not known.
3. Every line should have an accurate timestamp 'time' (integer representing seconds) and the lyric line 'text'.
4. Include natural instrumental break markers like "♪ (Instrumental Break) ♪" if there's a long gap.
Provide the output strictly as a JSON object adhering to the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lyrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.INTEGER, description: "Timestamp in seconds when this line is sung, relative to the start of the audio." },
                  text: { type: Type.STRING, description: "The lyric text sung at this timestamp." }
                },
                required: ["time", "text"]
              },
              description: "List of lyric lines with their corresponding timestamps."
            },
            isSynced: { type: Type.BOOLEAN, description: "True if synchronized timestamps are provided." }
          },
          required: ["lyrics", "isSynced"]
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return res.json({
        songId: songId ? String(songId) : undefined,
        lyrics: parsed.lyrics || [],
        isSynced: parsed.isSynced !== undefined ? parsed.isSynced : true,
        source: "gemini"
      });
    }
  } catch (err: any) {
    console.warn("Gemini Lyrics API failure or key missing:", err.message);
  }

  // 4. Fallback to generic generated timed lyrics if API fails or is not configured
  return res.json({
    songId: songId ? String(songId) : undefined,
    lyrics: generateGenericLyrics(finalTitle || "Awesome Song", finalArtist || "Talented Artist"),
    isSynced: true,
    source: "generic_fallback"
  });
});

// Admin upload new song
app.post("/api/songs", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized. Admin role is required." });
  }

  const { title, artist, genre, duration, audioFile, coverImage } = req.body;

  if (!title || !artist || !genre || !duration || !audioFile) {
    return res.status(400).json({ error: "Missing required metadata or audio file." });
  }

  try {
    const id = `song-${Date.now()}`;
    let audioUrl = "";
    let coverUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80"; // Default cover

    // Handle base64 audio upload
    if (audioFile.startsWith("data:audio")) {
      const parts = audioFile.split(";base64,");
      const mime = parts[0].split(":")[1];
      const extension = mime.split("/")[1] || "mp3";
      const buffer = Buffer.from(parts[1], "base64");
      const fileName = `audio-${id}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      fs.writeFileSync(filePath, buffer);
      audioUrl = `/uploads/${fileName}`;
    } else {
      audioUrl = audioFile; // fallback to absolute URL if provided
    }

    // Handle optional base64 cover image upload
    if (coverImage && coverImage.startsWith("data:image")) {
      const parts = coverImage.split(";base64,");
      const mime = parts[0].split(":")[1];
      const extension = mime.split("/")[1] || "png";
      const buffer = Buffer.from(parts[1], "base64");
      const fileName = `cover-${id}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      fs.writeFileSync(filePath, buffer);
      coverUrl = `/uploads/${fileName}`;
    } else if (coverImage) {
      coverUrl = coverImage;
    }

    const newSong = {
      id,
      title,
      artist,
      genre,
      duration: parseInt(duration) || 180,
      url: audioUrl,
      coverUrl,
      addedBy: req.user.id,
      isCustomUpload: true
    };

    songsList.push(newSong);
    saveSongs();

    res.status(201).json(newSong);
  } catch (error: any) {
    console.error("Song upload error:", error);
    res.status(500).json({ error: "Failed to upload and parse audio content." });
  }
});

// Like a song toggle
app.post("/api/songs/:id/like", authenticateToken, (req: any, res) => {
  const songId = req.params.id;
  const songExists = songsList.find((s: any) => s.id === songId);

  if (!songExists) {
    return res.status(404).json({ error: "Song not found." });
  }

  const user = usersList.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  if (!user.likedSongs) {
    user.likedSongs = [];
  }

  const index = user.likedSongs.indexOf(songId);
  let isLiked = false;
  if (index > -1) {
    user.likedSongs.splice(index, 1);
  } else {
    user.likedSongs.push(songId);
    isLiked = true;
  }

  saveUsers();
  res.json({ likedSongs: user.likedSongs, isLiked });
});

// Playlists Routes

// Fetch user playlists + public playlists
app.get("/api/playlists", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  let loggedUserId = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      loggedUserId = payload.id;
    }
  }

  // Filter public playlists + user's owned private playlists
  const playlists = playlistsList.filter(
    (p: any) => p.isPublic || (loggedUserId && p.createdBy === loggedUserId)
  );

  res.json(playlists);
});

// Fetch a single playlist by ID (supports public share access)
app.get("/api/playlists/:id", (req, res) => {
  const playlistId = req.params.id;
  const playlist = playlistsList.find((p: any) => p.id === playlistId);

  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found." });
  }

  // Access control
  if (!playlist.isPublic) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.id !== playlist.createdBy) {
      return res.status(403).json({ error: "Access denied. This playlist is private." });
    }
  }

  res.json(playlist);
});

// Create new playlist
app.post("/api/playlists", authenticateToken, (req: any, res) => {
  const { name, description, isPublic, songs, coverUrl } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Playlist name is required." });
  }

  const id = `playlist-${Date.now()}`;
  const newPlaylist = {
    id,
    name,
    description: description || "",
    songs: songs || [],
    createdBy: req.user.id,
    creatorName: req.user.name,
    isPublic: isPublic !== false,
    coverUrl: coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"
  };

  playlistsList.push(newPlaylist);
  savePlaylists();

  res.status(201).json(newPlaylist);
});

// Edit personal playlist
app.put("/api/playlists/:id", authenticateToken, (req: any, res) => {
  const playlistId = req.params.id;
  const playlist = playlistsList.find((p: any) => p.id === playlistId);

  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found." });
  }

  if (playlist.createdBy !== req.user.id) {
    return res.status(403).json({ error: "You can only edit your own playlists." });
  }

  const { name, description, isPublic, songs, coverUrl } = req.body;

  if (name !== undefined) playlist.name = name;
  if (description !== undefined) playlist.description = description;
  if (isPublic !== undefined) playlist.isPublic = isPublic;
  if (songs !== undefined) playlist.songs = songs;
  if (coverUrl !== undefined) playlist.coverUrl = coverUrl;

  savePlaylists();
  res.json(playlist);
});

// Delete personal playlist
app.delete("/api/playlists/:id", authenticateToken, (req: any, res) => {
  const playlistId = req.params.id;
  const index = playlistsList.findIndex((p: any) => p.id === playlistId);

  if (index === -1) {
    return res.status(404).json({ error: "Playlist not found." });
  }

  const playlist = playlistsList[index];
  if (playlist.createdBy !== req.user.id) {
    return res.status(403).json({ error: "You can only delete your own playlists." });
  }

  playlistsList.splice(index, 1);
  savePlaylists();

  res.json({ success: true, message: "Playlist deleted successfully." });
});

// AI Smart Playlist Generation via Gemini API
app.post("/api/ai/smart-playlist", authenticateToken, async (req: any, res) => {
  const { prompt, likedSongIds, mood, genre } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Gemini API Key is missing. Please configure it in Settings > Secrets."
    });
  }

  try {
    // Collect user details to feed into the prompt
    const userLikedSongs = songsList.filter((s: any) => (likedSongIds || []).includes(s.id));
    const catalogBrief = songsList.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      duration: s.duration
    }));

    // Setup Gemini Client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const contextPrompt = `
      You are an expert music recommendation system for "Melodia: Cloud Music & Smart Playlist Companion".
      Your goal is to build a beautiful "Smart Playlist" customized for the user's specific mood, genre choice, or prompt.

      User Preference Info:
      - Mood requested: "${mood || "Any"}"
      - Genre requested: "${genre || "Any"}"
      - Custom text prompt: "${prompt || "Chill music"}"
      - User's liked songs: ${JSON.stringify(userLikedSongs.map(s => `${s.title} by ${s.artist}`))}

      Our Music Catalog (You should try to match some of these song IDs if they fit):
      ${JSON.stringify(catalogBrief, null, 2)}

      Please respond with a strictly formatted JSON object that includes:
      1. A creative playlist 'name' reflecting the vibe.
      2. A personalized 'description' explaining the recommendation.
      3. An array of 'matchedSongIds' containing the IDs of songs from Our Music Catalog that fit. Choose at least 2 or 3 if they fit.
      4. An array of 'suggestedExternalSongs' (representing song recommendations not in our catalog that the user would love) containing objects with: title, artist, genre, and a short reason.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Vibrant name of the smart playlist" },
            description: { type: Type.STRING, description: "Personalized AI message explaining the selection" },
            matchedSongIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs of matched songs from our catalog"
            },
            suggestedExternalSongs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["title", "artist", "genre", "reason"]
              },
              description: "New song ideas outside our catalog that fit the vibe"
            }
          },
          required: ["name", "description", "matchedSongIds", "suggestedExternalSongs"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");

    // Automatically create the playlist in the user's account!
    const id = `smart-playlist-${Date.now()}`;
    const newPlaylist = {
      id,
      name: `✨ ${result.name}`,
      description: result.description,
      songs: result.matchedSongIds || [],
      createdBy: req.user.id,
      creatorName: req.user.name,
      isPublic: true,
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
      isSmart: true
    };

    playlistsList.push(newPlaylist);
    savePlaylists();

    res.json({
      playlist: newPlaylist,
      suggestedExternalSongs: result.suggestedExternalSongs || []
    });

  } catch (error: any) {
    console.error("AI Generation failed:", error);
    res.status(500).json({ error: "AI recommendation engine failed. Please try again." });
  }
});

// Vite Setup for static assets & production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
