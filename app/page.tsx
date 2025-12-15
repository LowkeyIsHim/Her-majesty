// app/page.tsx

import QuietHours from '../components/QuietHours';

// This is a server component wrapper for the client-side experience.
export default function Home() {
  return (
    <main className="min-h-screen bg-midnight text-white">
      <QuietHours />
    </main>
  );
}
