import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByh2g8IQA5mbN4hDaxlfNY8LWu__wTlK8",
  authDomain: "faiz-portfolio-2bea9.firebaseapp.com",
  projectId: "faiz-portfolio-2bea9",
  storageBucket: "faiz-portfolio-2bea9.firebasestorage.app",
  messagingSenderId: "303247401971",
  appId: "1:303247401971:web:f6254ee4e49a40e4aaa886",
  measurementId: "G-E5YDZ78438"
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const firestore = getFirestore(app);
    
    // Attempt to write a test doc
    const { doc, setDoc } = await import("firebase/firestore");
    const testId = `test_${Date.now()}`;
    await setDoc(doc(firestore, "test_connection", testId), {
      timestamp: new Date().toISOString(),
      status: "connected"
    });
    
    const snapshot = await getDocs(collection(firestore, "test_connection"));
    const docs = snapshot.docs.map(d => d.data());
    
    return NextResponse.json({
      success: true,
      message: "Firestore connected successfully!",
      docs
    });
  } catch (error: any) {
    console.error("Firestore test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || String(error),
      stack: error.stack || null
    }, { status: 500 });
  }
}
