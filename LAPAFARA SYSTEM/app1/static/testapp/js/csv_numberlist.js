// csv_numberlist.js

// Function to retrieve stored crop data from localStorage
function getStoredCropData() {
    return JSON.parse(localStorage.getItem('cropData')) || [];
  }
  
  // Function to update the #datacount span with the number of entries
  function updateCropDataCount() {
    const data = getStoredCropData();
    const countSpan = document.getElementById('datacount');
    if (countSpan) {
      countSpan.textContent = data.length;
    }
  }
  
  // Optional: Add this so it updates every time the storage changes
  window.addEventListener('storage', () => {
    updateCropDataCount();
  });
  
  // Run on page load
  document.addEventListener('DOMContentLoaded', () => {
    updateCropDataCount();
  });
  