import fs from "fs";
import path from "path";

// Define TypeScript interfaces for our lightweight tables
export interface WheelSpin {
  id: string;
  sessionId: string;
  gift: string;
  giftId: string;
  createdAt: string; // ISO date string
  country: string;
  device: string;
  browser: string;
  claimed: boolean;
  claimId: string;
  status: string; // 'pending', 'claimed', etc.
}

export interface AnalyticsEvent {
  id: string;
  event: string; // 'Visitor' | 'Wheel Open' | 'Wheel Spin' | 'Gift Won' | 'Claim Button Click'
  page: string;
  timestamp: string; // ISO date string
  sessionId: string;
  device: string;
  browser: string;
  country: string;
}

export interface GiftClaim {
  id: string;
  date: string; // ISO date string
  giftId: string;
  gift: string;
  email: string;
  name: string;
  status: string; // 'pending', 'approved', etc.
  notes: string; // Contains form details
  sessionId: string;
}

interface DatabaseSchema {
  wheel_spins: WheelSpin[];
  analytics_events: AnalyticsEvent[];
  gift_claims: GiftClaim[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure database directory and file exist
function initializeDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      wheel_spins: [],
      analytics_events: [],
      gift_claims: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

// Queue system to serialize writes and prevent concurrency issues
let writeQueue = Promise.resolve();

function enqueueWrite(schema: DatabaseSchema): Promise<void> {
  const promise = writeQueue.then(async () => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write to database:", err);
    }
  });
  writeQueue = promise;
  return promise;
}

// Helper to read data from the database
export function readDb(): DatabaseSchema {
  initializeDb();
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return {
      wheel_spins: parsed.wheel_spins || [],
      analytics_events: parsed.analytics_events || [],
      gift_claims: parsed.gift_claims || [],
    } as DatabaseSchema;
  } catch (err) {
    console.error("Failed to read database, returning empty schema:", err);
    return { wheel_spins: [], analytics_events: [], gift_claims: [] };
  }
}

// Methods for wheel_spins
export async function getWheelSpins(): Promise<WheelSpin[]> {
  const db = readDb();
  return db.wheel_spins;
}

export async function addWheelSpin(spin: Omit<WheelSpin, "id" | "createdAt">): Promise<WheelSpin> {
  const db = readDb();
  const newSpin: WheelSpin = {
    ...spin,
    id: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  db.wheel_spins.push(newSpin);
  await enqueueWrite(db);
  return newSpin;
}

// Methods for analytics_events
export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const db = readDb();
  return db.analytics_events;
}

export async function addAnalyticsEvent(event: Omit<AnalyticsEvent, "id" | "timestamp">): Promise<AnalyticsEvent> {
  const db = readDb();
  const newEvent: AnalyticsEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  db.analytics_events.push(newEvent);
  await enqueueWrite(db);
  return newEvent;
}

export async function claimWheelSpin(sessionId: string, giftId: string): Promise<boolean> {
  const db = readDb();
  const spins = db.wheel_spins.filter(s => s.sessionId === sessionId && s.giftId === giftId);
  if (spins.length > 0) {
    // Sort descending by createdAt
    spins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    spins[0].claimed = true;
    spins[0].status = "claimed";
    await enqueueWrite(db);
    return true;
  }
  return false;
}

// Methods for gift_claims
export async function getGiftClaims(): Promise<GiftClaim[]> {
  const db = readDb();
  return db.gift_claims || [];
}

export async function addGiftClaim(claim: Omit<GiftClaim, "id" | "date" | "status">): Promise<GiftClaim> {
  const db = readDb();
  if (!db.gift_claims) {
    db.gift_claims = [];
  }
  const newClaim: GiftClaim = {
    ...claim,
    id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    status: "pending",
  };
  db.gift_claims.push(newClaim);
  await enqueueWrite(db);
  return newClaim;
}
