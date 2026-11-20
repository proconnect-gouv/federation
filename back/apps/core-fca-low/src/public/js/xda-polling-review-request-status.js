import { startPolling } from "./polling-utils.js";
import { announce, showSections } from "./xda-sections.js";

const POLLING_INTERVAL_IN_MS = 1000;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const container = document.querySelector(".xda-review-request");
    if (!container) return;

    const status = container.getAttribute("data-status");
    showSections(container, { status });

    // The approval buttons are shown once the new device displays the emojis
    if (status !== "verification_started") return;

    startPolling({
      url: container.getAttribute("data-status-url"),
      intervalInMs: POLLING_INTERVAL_IN_MS,
      onResult: (result) => {
        if (result?.status === "verification_started") {
          return true;
        }
        if (result?.status === "emojis_displayed") {
          showSections(container, { status: result.status });
          announce(
            container,
            "Les emojis sont affichés sur votre nouvel appareil. Vous pouvez valider ou refuser la demande.",
          );
          return false;
        }
        // Reviewed from another window or expired: let the user display the
        // result, instead of leaving the page on their behalf
        showSections(container, { status: "changed" });
        announce(
          container,
          "Cette demande a été traitée depuis une autre fenêtre ou a expiré.",
        );
        return false;
      },
    });
  },
  false,
);
