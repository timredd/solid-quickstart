export default function NotFound() {
  return (
    <main class="grid grow place-items-center bg-background px-6 py-24 sm:min-h-[900px] sm:py-32 lg:px-8">
      <div class="text-center">
        <p class="font-semibold text-base text-muted-foreground">404</p>
        <h1 class="mt-4 text-balance font-semibold text-5xl text-foreground tracking-tight sm:text-7xl">
          Page not found
        </h1>
        <p class="mt-6 text-pretty font-medium text-lg text-muted-foreground sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            class="rounded-md bg-arctic-600 px-3.5 py-2.5 font-semibold text-primary-foreground text-sm shadow-xs hover:bg-arctic-500 focus-visible:outline-2 focus-visible:outline-arctic-600 focus-visible:outline-offset-2"
          >
            Go back home
          </a>
          <a
            href="/support"
            class="font-semibold text-accent-foreground text-sm"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
