const LOCAL_STORAGE_NOTICE_CLOSED = "maintenanceNoticeClosed";

window.addEventListener("DOMContentLoaded", () => {
  const notice = document.getElementById("maintenance-notice");
  const closeButton = document.getElementById("notice-close");

  if (!notice) return;

  const alreadyClosed = localStorage.getItem(LOCAL_STORAGE_NOTICE_CLOSED);
  if (alreadyClosed) {
    notice.remove();
    return;
  }

  function saveNoticeClosed() {
    localStorage.setItem(LOCAL_STORAGE_NOTICE_CLOSED, "true");
    notice.remove();
  }

  closeButton?.addEventListener("click", saveNoticeClosed);
});
