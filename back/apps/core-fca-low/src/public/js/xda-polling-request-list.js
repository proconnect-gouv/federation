import { startPolling } from "./polling-utils.js";

const POLLING_INTERVAL_IN_MS = 1000;

const toSortedKey = (requestIds) => [...requestIds].sort().join(",");

// Lets the user refresh the list when they want to, as reloading it on their
// behalf would make them lose their focus and their position in the page
const showRefreshNotice = (container, message) => {
  const notice = document.createElement("p");
  notice.className = "fr-mb-1w";
  notice.textContent = message;
  container.querySelector("[data-xda-refresh-message]").replaceChildren(notice);
  container
    .querySelector("[data-xda-refresh-button]")
    .classList.remove("fr-hidden");
};

// The location of a request is looked up after its creation
const updateLocations = (container, notReviewedRequests) => {
  notReviewedRequests.forEach(({ id, location }) => {
    const locationElement = container.querySelector(
      `[data-request-id="${id}"] [data-request-location]`,
    );
    if (locationElement && locationElement.textContent !== location) {
      locationElement.textContent = location;
    }
  });
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const container = document.querySelector(".xda-review-requests");
    if (!container) return;

    container
      .querySelector("[data-xda-refresh-button]")
      .addEventListener("click", () => window.location.reload());

    const displayedRequestIds = toSortedKey(
      [...container.querySelectorAll("[data-request-id]")].map((item) =>
        item.getAttribute("data-request-id"),
      ),
    );

    startPolling({
      url: container.getAttribute("data-not-reviewed-requests-url"),
      intervalInMs: POLLING_INTERVAL_IN_MS,
      onResult: (result) => {
        if (!result) {
          showRefreshNotice(
            container,
            "La liste des demandes de connexion n'a pas pu être mise à jour.",
          );
          return false;
        }

        const { notReviewedRequests } = result;
        updateLocations(container, notReviewedRequests);

        const requestIds = notReviewedRequests.map(({ id }) => id);
        if (toSortedKey(requestIds) !== displayedRequestIds) {
          showRefreshNotice(
            container,
            "La liste des demandes de connexion a changé.",
          );
          return false;
        }
        return true;
      },
    });
  },
  false,
);
