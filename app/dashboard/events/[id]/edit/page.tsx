import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { EventForm } from "../../EventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const event = await prisma.event.findFirst({
    where: { id, organizationId: payload.organizationId },
    include: { ticketTypes: true, promoCodes: true },
  });

  if (!event) redirect("/dashboard/events");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
        Edit Event
      </h1>
      <p className="mt-2 text-zinc-400">
        Update your event details.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Need to configure seating?{" "}
        <Link
          href={`/admin5550/edit/${id}`}
          className="text-accent-400 hover:text-accent-300"
        >
          Open seating designer
        </Link>
      </p>
      <div className="mt-8">
        <EventForm
          event={{
            id: event.id,
            name: event.name,
            description: event.description,
            date: event.date.toISOString(),
            location: event.location,
            status: event.status,
            flyerUrl: event.flyerUrl,
            venueId: event.venueId,
            ticketTypes: event.ticketTypes.map((t) => ({
              id: t.id,
              name: t.name,
              price: t.price,
              quantity: t.quantity,
            })),
            promoCodes: event.promoCodes.map((p) => ({
              id: p.id,
              code: p.code,
              discountType: p.discountType,
              discountValue: p.discountValue,
            })),
          }}
        />
      </div>
    </div>
  );
}
