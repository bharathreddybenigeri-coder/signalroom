export const metadata = { title: "Signalroom — Dashboard", description: "Realtime observatory" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f8f8f6]">{children}</div>;
}
