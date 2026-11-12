const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
};

// Calls `onResult` with the JSON fetched from `url` (or null if the request
// failed) every `intervalInMs`, until `onResult` returns false.
export const startPolling = ({ url, intervalInMs, onResult }) => {
  const poll = async () => {
    let result;
    try {
      result = await fetchJson(url);
    } catch (error) {
      console.error(error);
      // network errors are transient: keep polling
      setTimeout(poll, intervalInMs);
      return;
    }

    if (onResult(result)) {
      setTimeout(poll, intervalInMs);
    }
  };

  setTimeout(poll, intervalInMs);
};
