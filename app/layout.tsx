import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Signalroom — Realtime observatory",
  description: "A high-performance realtime data visualization dashboard. Watch every signal breathe.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "rounded-xl border border-[#e6e6e3] bg-white shadow-[0_5px_0_#e9e9e6,0_18px_40px_rgba(25,25,30,.10)] font-sans",
              title: "text-[#242422] font-extrabold text-sm tracking-[-.02em]",
              description: "text-[#858580] text-xs font-medium",
            },
          }}
        />
      </body>
    </html>
  );
}
