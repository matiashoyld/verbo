import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-verbo-dark to-verbo-purple p-4">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-verbo-green hover:bg-verbo-green/90",
            footerActionLink: "text-verbo-blue hover:text-verbo-blue/90",
          },
        }}
        redirectUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
}
