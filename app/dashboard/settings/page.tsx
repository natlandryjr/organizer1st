import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { OrganizationSettingsForm } from "./OrganizationSettingsForm";

export default async function OrganizationSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect("/login");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: payload.organizationId },
  });

  if (!organization) {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
        Organization Settings
      </h1>
      <p className="mt-2 text-zinc-400">
        Manage your organization details and Stripe connection.
      </p>

      <OrganizationSettingsForm
        organizationId={organization.id}
        organizationName={organization.name}
        stripeAccountId={organization.stripeAccountId}
      />
    </div>
  );
}
