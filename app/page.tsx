import { prisma } from "@/lib/prisma";
import { HomeContent } from "@/components/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: { id: string; name: string; date: Date; description: string; flyerUrl: string | null }[] = [];
  try {
    events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        date: true,
        description: true,
        flyerUrl: true,
      },
    });
  } catch (err) {
    console.error("Home page events fetch:", err);
  }

  return <HomeContent events={events} />;
}
