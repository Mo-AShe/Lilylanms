import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* Firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyA82bYdXDLQJAY8UIkFztzLoKWXQM4g8vA",
  authDomain: "farm-d3eaa.firebaseapp.com",
  projectId: "farm-d3eaa",
  storageBucket: "farm-d3eaa.appspot.com",
  messagingSenderId: "515868951849",
  appId: "1:515868951849:web:e7abd02182bb3b04402338"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

let dogsData = [];

/* Load all dogs */
async function loadDogs() {
  resultsDiv.innerHTML = "<p style='color: white;'>Loading pack data...</p>";
  try {
    const snapshot = await getDocs(collection(db, "Dog"));
    dogsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    renderDogs(dogsData);
  } catch (error) {
    console.error("Error loading dogs:", error);
    resultsDiv.innerHTML = "<p>Error loading data. Check console.</p>";
  }
}

/* Render dashboard */
function renderDogs(dogs) {
  if (dogs.length === 0) {
    resultsDiv.innerHTML = "<p style='color: white;'>No dogs match your search.</p>";
    return;
  }

  const now = new Date();

  // Mapping through dogs to create an array of HTML strings for better performance
  const htmlContent = dogs.map(dog => {
    let statusText = "No Date Set";
    let statusClass = "status-none";
    let displayDate = "-";
    
    if (dog["Monthly payment"]) {
      // 1. Safe Date Conversion
      const payDate = dog["Monthly payment"].seconds 
        ? new Date(dog["Monthly payment"].seconds * 1000) 
        : new Date(dog["Monthly payment"]);

      // 2. Format the date for the card
      displayDate = payDate.toLocaleDateString();

      // 3. Compare with 'now'
      if (payDate < now) {
        statusText = "Payment Overdue";
        statusClass = "status-overdue";
      } else {
        statusText = "Payment Up-to-date";
        statusClass = "status-paid";
      }
    }

    return `
      <a href="dog-details.htm?id=${dog.id}" style="text-decoration: none; color: inherit;">
        <div class="card">
          <div class="payment-badge ${statusClass}">${statusText}</div>
          <h3><i class="fas fa-paw" style="font-size: 0.9em; margin-right: 8px;"></i>${dog.Name || "No Name"}</h3>
          <p><strong>Owner:</strong> ${dog["Owner/Sponser"] || "-"}</p>
          <p><strong>Next Due:</strong> ${displayDate}</p>
          <p style="color: var(--primary); font-size: 0.8rem; margin-top: 12px; font-weight: bold;">
            Manage Profile <i class="fas fa-arrow-right"></i>
          </p>
        </div>
      </a>
    `;
  }).join(''); // Join all cards into one single string

  resultsDiv.innerHTML = htmlContent;
}

/* Live search filter */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = dogsData.filter(dog =>
    String(dog.Name || "").toLowerCase().includes(value) ||
    String(dog["Pass dog name"] || "").toLowerCase().includes(value) ||
    String(dog["Owner/Sponser"] || "").toLowerCase().includes(value) ||
    String(dog.ID || "").includes(value)
  );

  renderDogs(filtered);
});

/* Start */
loadDogs();