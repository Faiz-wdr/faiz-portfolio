import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, query, where, deleteDoc } from "firebase/firestore";

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

// ----------------------------------------------------
// Firebase Client Web Config Initialization
// ----------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyByh2g8IQA5mbN4hDaxlfNY8LWu__wTlK8",
  authDomain: "faiz-portfolio-2bea9.firebaseapp.com",
  projectId: "faiz-portfolio-2bea9",
  storageBucket: "faiz-portfolio-2bea9.firebasestorage.app",
  messagingSenderId: "303247401971",
  appId: "1:303247401971:web:f6254ee4e49a40e4aaa886",
  measurementId: "G-E5YDZ78438"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

// ----------------------------------------------------
// Local File Database Fallback (For offline safety)
// ----------------------------------------------------
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

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

let writeQueue = Promise.resolve();

function enqueueWrite(schema: DatabaseSchema): Promise<void> {
  const promise = writeQueue.then(async () => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), "utf-8");
    } catch (err) {
      console.error("[Database] Failed to write to local database:", err);
    }
  });
  writeQueue = promise;
  return promise;
}

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
    console.error("[Database] Failed to read local database:", err);
    return { wheel_spins: [], analytics_events: [], gift_claims: [] };
  }
}

// ----------------------------------------------------
// Methods for wheel_spins
// ----------------------------------------------------
export async function getWheelSpins(): Promise<WheelSpin[]> {
  try {
    const snapshot = await getDocs(collection(firestore, "wheel_spins"));
    return snapshot.docs.map(doc => doc.data() as WheelSpin);
  } catch (err) {
    console.error("[Database] Firestore getWheelSpins error, falling back:", err);
    return readDb().wheel_spins;
  }
}

export async function addWheelSpin(spin: Omit<WheelSpin, "id" | "createdAt">): Promise<WheelSpin> {
  const newSpin: WheelSpin = {
    ...spin,
    id: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(firestore, "wheel_spins", newSpin.id), newSpin);
    return newSpin;
  } catch (err) {
    console.error("[Database] Firestore addWheelSpin error, falling back to file:", err);
  }

  const db = readDb();
  db.wheel_spins.push(newSpin);
  await enqueueWrite(db);
  return newSpin;
}

// ----------------------------------------------------
// Methods for analytics_events
// ----------------------------------------------------
export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    const snapshot = await getDocs(collection(firestore, "analytics_events"));
    return snapshot.docs.map(doc => doc.data() as AnalyticsEvent);
  } catch (err) {
    console.error("[Database] Firestore getAnalyticsEvents error, falling back:", err);
    return readDb().analytics_events;
  }
}

export async function addAnalyticsEvent(event: Omit<AnalyticsEvent, "id" | "timestamp">): Promise<AnalyticsEvent> {
  const newEvent: AnalyticsEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(firestore, "analytics_events", newEvent.id), newEvent);
    return newEvent;
  } catch (err) {
    console.error("[Database] Firestore addAnalyticsEvent error, falling back to file:", err);
  }

  const db = readDb();
  db.analytics_events.push(newEvent);
  await enqueueWrite(db);
  return newEvent;
}

// ----------------------------------------------------
// Claim Spin handler
// ----------------------------------------------------
export async function claimWheelSpin(sessionId: string, giftId: string): Promise<boolean> {
  try {
    const q = query(collection(firestore, "wheel_spins"), where("sessionId", "==", sessionId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const spins = snapshot.docs.map(d => ({ docId: d.id, ...d.data() as WheelSpin }));
      spins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const latestSpin = spins[0];
      let finalGift = latestSpin.gift;
      let finalGiftId = latestSpin.giftId;

      if (latestSpin.giftId !== giftId) {
        finalGiftId = giftId;
        if (giftId === "PersonalOs Pro") finalGift = "PersonalOS Pro License!";
        else if (giftId === "Personal Website") finalGift = "Custom Personal Website!";
        else if (giftId === "Resume Review") finalGift = "Detailed Resume Review!";
        else if (giftId === "Ui Audit") finalGift = "UI/UX Product Audit!";
        else if (giftId === "Coffee Chat") finalGift = "1-on-1 Coffee Chat!";
        else if (giftId === "Surprise") finalGift = "A Surprise Gift!";
      }

      await updateDoc(doc(firestore, "wheel_spins", latestSpin.docId), {
        claimed: true,
        status: "claimed",
        giftId: finalGiftId,
        gift: finalGift,
      });
      return true;
    } else {
      // Direct claim link auto-spin logging fallback
      let giftTitle = "A Surprise Gift!";
      if (giftId === "PersonalOs Pro") giftTitle = "PersonalOS Pro License!";
      else if (giftId === "Personal Website") giftTitle = "Custom Personal Website!";
      else if (giftId === "Resume Review") giftTitle = "Detailed Resume Review!";
      else if (giftId === "Ui Audit") giftTitle = "UI/UX Product Audit!";
      else if (giftId === "Coffee Chat") giftTitle = "1-on-1 Coffee Chat!";

      const newSpin = {
        id: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        gift: giftTitle,
        giftId: giftId,
        createdAt: new Date().toISOString(),
        country: "Unknown",
        device: "Desktop",
        browser: "Chrome",
        claimed: true,
        claimId: "",
        status: "claimed",
      };
      await setDoc(doc(firestore, "wheel_spins", newSpin.id), newSpin);
      return true;
    }
  } catch (err) {
    console.error("[Database] Firestore claimWheelSpin error, falling back:", err);
  }

  // Local file fallback
  const db = readDb();
  const spins = db.wheel_spins.filter(s => s.sessionId === sessionId);
  if (spins.length > 0) {
    spins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (spins[0].giftId !== giftId) {
      spins[0].giftId = giftId;
      if (giftId === "PersonalOs Pro") spins[0].gift = "PersonalOS Pro License!";
      else if (giftId === "Personal Website") spins[0].gift = "Custom Personal Website!";
      else if (giftId === "Resume Review") spins[0].gift = "Detailed Resume Review!";
      else if (giftId === "Ui Audit") spins[0].gift = "UI/UX Product Audit!";
      else if (giftId === "Coffee Chat") spins[0].gift = "1-on-1 Coffee Chat!";
      else if (giftId === "Surprise") spins[0].gift = "A Surprise Gift!";
    }

    spins[0].claimed = true;
    spins[0].status = "claimed";
    await enqueueWrite(db);
    return true;
  } else {
    let giftTitle = "A Surprise Gift!";
    if (giftId === "PersonalOs Pro") giftTitle = "PersonalOS Pro License!";
    else if (giftId === "Personal Website") giftTitle = "Custom Personal Website!";
    else if (giftId === "Resume Review") giftTitle = "Detailed Resume Review!";
    else if (giftId === "Ui Audit") giftTitle = "UI/UX Product Audit!";
    else if (giftId === "Coffee Chat") giftTitle = "1-on-1 Coffee Chat!";

    const newSpin = {
      id: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      gift: giftTitle,
      giftId: giftId,
      createdAt: new Date().toISOString(),
      country: "Unknown",
      device: "Desktop",
      browser: "Chrome",
      claimed: true,
      claimId: "",
      status: "claimed",
    };
    db.wheel_spins.push(newSpin);
    await enqueueWrite(db);
    return true;
  }
}

// ----------------------------------------------------
// Methods for gift_claims
// ----------------------------------------------------
export async function getGiftClaims(): Promise<GiftClaim[]> {
  try {
    const snapshot = await getDocs(collection(firestore, "gift_claims"));
    return snapshot.docs.map(doc => doc.data() as GiftClaim);
  } catch (err) {
    console.error("[Database] Firestore getGiftClaims error, falling back:", err);
    return readDb().gift_claims || [];
  }
}

export async function addGiftClaim(claim: Omit<GiftClaim, "id" | "date" | "status">): Promise<GiftClaim> {
  const newClaim: GiftClaim = {
    ...claim,
    id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    status: "pending",
  };

  try {
    await setDoc(doc(firestore, "gift_claims", newClaim.id), newClaim);
    return newClaim;
  } catch (err) {
    console.error("[Database] Firestore addGiftClaim error, falling back to file:", err);
  }

  const db = readDb();
  if (!db.gift_claims) {
    db.gift_claims = [];
  }
  db.gift_claims.push(newClaim);
  await enqueueWrite(db);
  return newClaim;
}

export async function resetDb(): Promise<void> {
  const collections = ["wheel_spins", "analytics_events", "gift_claims", "test_connection"];
  for (const collName of collections) {
    try {
      const snapshot = await getDocs(collection(firestore, collName));
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(firestore, collName, docSnapshot.id));
      }
    } catch (err) {
      console.error(`[Database] Error clearing collection ${collName}:`, err);
    }
  }

  // Clear local file DB fallback
  const initialData: DatabaseSchema = {
    wheel_spins: [],
    analytics_events: [],
    gift_claims: [],
  };
  await enqueueWrite(initialData);
}
