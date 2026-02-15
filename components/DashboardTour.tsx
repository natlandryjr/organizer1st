"use client";

import { useCallback, useEffect, useState } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";
import { usePathname } from "next/navigation";

const TOUR_STORAGE_KEY = "organizer1st_tour_completed";

const steps: Step[] = [
  {
    target: "body",
    content: "Welcome to Organizer1st! Let's take a quick tour of your dashboard so you can get started.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-overview"]',
    content: "This is your Overview. You'll land here after logging in and see quick links to key actions.",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-create-event"]',
    content: (
      <span>
        Click <strong>Create Event</strong> to set up your first event with seating, ticket types, and more. This is where you&apos;ll spend most of your time!
      </span>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-organization"]',
    content: (
      <span>
        In <strong>Organization</strong> settings, connect your Stripe account so ticket revenue flows directly to you. Do this before selling tickets.
      </span>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-events"]',
    content: (
      <span>
        <strong>Events</strong> shows all your events. From here you can manage attendees, edit details, and view each event&apos;s page.
      </span>
    ),
    placement: "bottom",
  },
  {
    target: "body",
    content: "You're all set! Create your first event, connect Stripe, and start selling. Need help? Visit our Help page anytime.",
    placement: "center",
  },
];

export function DashboardTour() {
  const pathname = usePathname();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed && pathname?.startsWith("/dashboard")) {
      setRun(true);
    }
  }, [pathname]);

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      setRun(false);
    }
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
      styles={{
        options: {
          arrowColor: "#18181b",
          backgroundColor: "#18181b",
          overlayColor: "rgba(0, 0, 0, 0.7)",
          primaryColor: "#f59e0b",
          textColor: "#e4e4e7",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          fontSize: 15,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "#f59e0b",
          color: "#0c0a09",
        },
        buttonBack: {
          color: "#a1a1aa",
        },
        buttonSkip: {
          color: "#71717a",
        },
      }}
    />
  );
}
