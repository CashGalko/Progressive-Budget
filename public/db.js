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

//   Checks indexedDB for any added records while offline, and posts the changes to the backend when the app goes back online, then clears the indexedDB.
  function checkDB() {
    console.log('check db invoked');
  
    // Opens a transaction
    let transaction = db.transaction(['BudgetStore'], 'readwrite');
  
    // access your BudgetStore object
    const store = transaction.objectStore('BudgetStore');
  
    // Get all records 
    const getAll = store.getAll();
  
    getAll.onsuccess = function () {
    //   Adds all records in the store to the backend when the app comes back online
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((res) => {
            //If the response has at least 1 entry, we clear the store because the data has now been stored in the backend.
            if (res.length !== 0) {

              transaction = db.transaction(['BudgetStore'], 'readwrite');
 
              const currentStore = transaction.objectStore('BudgetStore');
  
              currentStore.clear();
             
            }
          });
      }
    };
  };

//   Checks to see if app comes online, then fires the checkDB function to update the backend with any changes.
window.addEventListener('online', checkDB);