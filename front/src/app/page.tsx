import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted dark:from-background dark:to-background">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Bensalem Rayan</h1>

        <p className="text-sm text-muted-foreground">
          Welcome to the home page!
        </p>

        <Input
          placeholder="Type something..."
          className="mt-2 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
        />

        {/* Example primary button */}
        <button className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
          Continue
        </button>
      </div>
    </main>
  );
}
