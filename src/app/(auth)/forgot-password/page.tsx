import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — Notion Clone",
};

// Clerk handles forgot password through the SignIn component's "Forgot password?" link.
// This page provides a direct entry point that starts at the reset flow.
export default function ForgotPasswordPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none w-full",
          headerTitle: "text-xl font-bold",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          footerActionLink: "text-primary hover:text-primary/80",
          formFieldInput: "border-input",
        },
      }}
      initialValues={{ emailAddress: "" }}
      forceRedirectUrl="/documents"
    />
  );
}
