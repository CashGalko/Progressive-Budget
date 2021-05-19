let db;
let budgetVersion;
// Creates new db request.
const request = window.indexedDB.open("BudgetDB", budgetVersion || 21);

request.onupgradeneeded = function (e) {
    console.log('Upgrade needed in IndexDB');
  
    const { oldVersion } = e;
    const newVersion = e.newVersion || db.version;
  
    console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);
  
    db = e.target.result;
  
    if (db.objectStoreNames.length === 0) {
      db.createObjectStore('BudgetStore', { autoIncrement: true });
    }
  };

//   Handles the request error.
  request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
  };

//   Handles the request success
request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;
  
    // If the app is online, it will fire the checkDB function
    if (navigator.onLine) {
      console.log('Backend online!');
      checkDB();
    }
  };

//   Checks to see if app comes online, then fires the checkDB function to update the backend with any changes.
window.addEventListener('online', checkDB);