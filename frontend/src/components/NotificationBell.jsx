export default function NotificationBell() {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label="Notifications"
      aria-disabled="true"
      title="Notifications (coming soon)"
    >
      <svg
        className="icon-button-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </button>
  );
}
