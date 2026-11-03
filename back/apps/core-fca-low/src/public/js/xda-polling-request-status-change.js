import { startPolling } from "./polling-utils.js";

const POLLING_INTERVAL_IN_MS = 2000;
const FINAL_STATUSES = ["approved", "rejected", "error"];

const showSection = (container, status) => {
  container.querySelectorAll("[data-xda-status-section]").forEach((section) => {
    const sectionStatuses = section
      .getAttribute("data-xda-status-section")
      .split(" ");
    const isVisible = sectionStatuses.includes(status);
    section.classList.toggle("fr-hidden", !isVisible);
  });
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const container = document.querySelector(".xda-waiting");
    if (!container) return;

    const showEmojisButton = document.getElementById("xda-show-emojis-button");
    showEmojisButton.addEventListener("click", () => {
      showEmojisButton.classList.add("fr-hidden");
      document.getElementById("xda-emojis").classList.remove("fr-hidden");
    });

    const initialStatus = container.getAttribute("data-status");
    showSection(container, initialStatus);

    if (FINAL_STATUSES.includes(initialStatus)) return;

    startPolling({
      url: container.getAttribute("data-status-url"),
      intervalInMs: POLLING_INTERVAL_IN_MS,
      onResult: (result) => {
        const status = result?.status ?? "error";
        showSection(container, status);
        return !FINAL_STATUSES.includes(status);
      },
    });
  },
  false,
);
