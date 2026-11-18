(() => {
  let database;
  const open = () => database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("metrics-preview-download-queue", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("pptx", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async function access(mode, operation) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("pptx", mode);
      const request = operation(transaction.objectStore("pptx"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  window.placementPptQueue = {
    add: (entry) => access("readwrite", (store) => store.add(entry)),
    list: () => access("readonly", (store) => store.getAll()),
    remove: (id) => access("readwrite", (store) => store.delete(id)),
  };
})();
