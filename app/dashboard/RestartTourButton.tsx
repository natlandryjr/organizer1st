"use client";

const TOUR_STORAGE_KEY = "organizer1st_tour_completed";

export function RestartTourButton() {
  function handleRestart() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOUR_STORAGE_KEY);
      window.location.reload();
    }
  }

  return (
    <button
      type="button"
      onClick={handleRestart}
      className="text-amber-400 hover:text-amber-300 underline"
    >
      Take the tour again
    </button>
  );
}
