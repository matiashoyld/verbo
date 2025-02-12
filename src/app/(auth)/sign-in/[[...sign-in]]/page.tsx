import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-[350px]",
            card: "shadow-lg",
          },
        }}
        afterSignInUrl="/professor"
      />
    </div>
  );
}
