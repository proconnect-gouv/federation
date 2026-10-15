const POLLING_INTERVAL_IN_MS = 2000;
const FINAL_STATUSES = ["approved", "rejected", "error"];

const showSection = (container, status) => {
  container.querySelectorAll("[data-xda-section]").forEach((section) => {
    const isVisible = section.getAttribute("data-xda-section") === status;
    section.classList.toggle("fr-hidden", !isVisible);
  });
};

const fetchStatus = async (statusUrl) => {
  const response = await fetch(statusUrl, {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  if (!response.ok) {
    return { status: "error" };
  }
  return response.json();
};

const poll = async (container, statusUrl) => {
  let result;
  try {
    result = await fetchStatus(statusUrl);
  } catch (error) {
    console.error(error);
    // network errors are transient: keep polling
    setTimeout(() => poll(container, statusUrl), POLLING_INTERVAL_IN_MS);
    return;
  }

  showSection(container, result.status);

  if (!FINAL_STATUSES.includes(result.status)) {
    setTimeout(() => poll(container, statusUrl), POLLING_INTERVAL_IN_MS);
  }
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const container = document.querySelector(".xda-waiting");
    if (!container) return;

    const statusUrl = container.getAttribute("data-status-url");
    const initialStatus = container.getAttribute("data-status");
    showSection(container, initialStatus);

    if (!FINAL_STATUSES.includes(initialStatus)) {
      setTimeout(() => poll(container, statusUrl), POLLING_INTERVAL_IN_MS);
    }
  },
  false,
);
