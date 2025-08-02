import DashboardCards from "@/components/dashboard-cards";
export const runtime = "edge";

export default async function Dashboard() {
  return (
    <div className="mx-auto max-w-lg">
      <DashboardCards />
    </div>
  );
}
