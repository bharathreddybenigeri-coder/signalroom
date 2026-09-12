import { generateInitialDataset } from "@/lib/dataGenerator";
import { DataProvider } from "@/components/providers/DataProvider";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

/**
 * Server Component: generates the initial 1,500-point snapshot on the server,
 * then hands off to a Client Provider for the real-time stream and interactions.
 */
export default async function DashboardPage() {
  const initialData = generateInitialDataset(1500);
  return (
    <DataProvider initialData={initialData}>
      <DashboardClient />
    </DataProvider>
  );
}
