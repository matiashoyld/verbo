import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-verbo-dark to-verbo-purple p-4">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-verbo-green hover:bg-verbo-green/90",
            footerActionLink: "text-verbo-blue hover:text-verbo-blue/90",
          },
        }}
        redirectUrl="/dashboard"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
