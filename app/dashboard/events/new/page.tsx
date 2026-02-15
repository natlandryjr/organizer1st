import { EventForm } from "../EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
        Create New Event
      </h1>
      <p className="mt-2 text-zinc-400">
        Add the basic details for your event. You can add seating and more options after creating.
      </p>
      <div className="mt-8">
        <EventForm />
      </div>
    </div>
  );
}
