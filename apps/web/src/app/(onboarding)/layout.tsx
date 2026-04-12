export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
