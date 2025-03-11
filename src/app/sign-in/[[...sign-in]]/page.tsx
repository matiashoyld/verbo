import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-verbo-purple hover:bg-verbo-purple/90",
            footerActionLink: "text-verbo-purple hover:text-verbo-purple/90",
          },
        }}
        redirectUrl="/"
        afterSignInUrl="/"
      />
    </div>
  );
}
