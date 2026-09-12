import "./globals.css";

export const metadata = { title: "Signalroom — Realtime observatory", description: "A high-performance realtime data visualization dashboard." };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}