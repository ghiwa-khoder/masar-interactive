import "./globals.css";

export const metadata = {
  title: "MASAR Interactive",
  description: "Creative development, 3D and interactive digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
