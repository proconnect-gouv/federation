import { startPolling } from "./polling-utils.js";
import { announce, focusVisibleTitle, showSections } from "./xda-sections.js";

const POLLING_INTERVAL_IN_MS = 1000;
const FINAL_STATUSES = ["approved", "rejected", "error"];

// Lets the RIE computer approve or reject the request, once the emojis it
// shows are also displayed on this device
const markEmojisAsDisplayed = async (container) => {
  try {
    const response = await fetch(
      container.getAttribute("data-emojis-displayed-url"),
      {
        method: "POST",
        credentials: "same-origin",
        body: new URLSearchParams({
          csrfToken: container.getAttribute("data-csrf-token"),
        }),
      },
    );
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const container = document.querySelector(".xda-flow");
    if (!container) return;

    const state = {
      status: container.getAttribute("data-status"),
      step: "instructions",
      emojisDisplayedNotification: "idle", // then "sending" and "sent"
    };

    const notifyEmojisDisplayed = () => {
      const areEmojisDisplayed =
        state.step === "verification" &&
        state.status === "verification_started";
      if (!areEmojisDisplayed || state.emojisDisplayedNotification !== "idle") {
        return;
      }
      state.emojisDisplayedNotification = "sending";
      // On failure, the next polling result tries again
      markEmojisAsDisplayed(container).then((isSent) => {
        state.emojisDisplayedNotification = isSent ? "sent" : "idle";
      });
    };

    const render = () => {
      showSections(container, state);
      notifyEmojisDisplayed();
    };
    render();

    document
      .getElementById("xda-show-emojis-button")
      .addEventListener("click", () => {
        state.step = "verification";
        render();
        focusVisibleTitle(container);
      });

    if (FINAL_STATUSES.includes(state.status)) return;

    startPolling({
      url: container.getAttribute("data-status-url"),
      intervalInMs: POLLING_INTERVAL_IN_MS,
      onResult: (result) => {
        const previousStatus = state.status;
        state.status = result?.status ?? "error";
        render();

        if (FINAL_STATUSES.includes(state.status)) {
          focusVisibleTitle(container);
          return false;
        }
        const areEmojisNewlyDisplayed =
          state.step === "verification" &&
          previousStatus === "created" &&
          state.status !== "created";
        if (areEmojisNewlyDisplayed) {
          announce(
            container,
            "Les emojis sont affichés. Comparez-les avec ceux de votre ordinateur RIE.",
          );
        }
        return true;
      },
    });
  },
  false,
);
