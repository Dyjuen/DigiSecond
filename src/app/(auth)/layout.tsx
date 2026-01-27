export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            {/* Background glow */}
            <div className="fixed inset-0 z-0" style={{
                background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)"
            }} />

            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
}
