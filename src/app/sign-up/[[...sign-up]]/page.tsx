import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-verbo-purple hover:bg-verbo-purple/90",
            footerActionLink: "text-verbo-purple hover:text-verbo-purple/90",
          },
        }}
        redirectUrl="/"
        afterSignUpUrl="/"
        unsafeMetadata={{
          role: "RECRUITER",
          signUpUrl: "/sign-up",
          isRecruiter: true,
          userType: "RECRUITER",
        }}
      />
    </div>
  );
}
