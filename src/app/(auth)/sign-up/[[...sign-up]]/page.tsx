import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-[350px]",
            card: "shadow-lg",
          },
        }}
        afterSignUpUrl="/professor"
      />
    </div>
  );
}
