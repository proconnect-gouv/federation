import { startPolling } from "./polling-utils.js";

const POLLING_INTERVAL_IN_MS = 1000;

const toSortedKey = (requestIds) => [...requestIds].sort().join(",");

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const container = document.querySelector(".xda-review-requests");
    if (!container) return;

    const displayedRequestIds = toSortedKey(
      [...container.querySelectorAll("[data-request-id]")].map((item) =>
        item.getAttribute("data-request-id"),
      ),
    );

    startPolling({
      url: container.getAttribute("data-awaiting-requests-url"),
      intervalInMs: POLLING_INTERVAL_IN_MS,
      onResult: (result) => {
        // Reload to display the up-to-date list, or the error page
        if (
          !result ||
          toSortedKey(result.awaitingRequestIds) !== displayedRequestIds
        ) {
          window.location.reload();
          return false;
        }
        return true;
      },
    });
  },
  false,
);
