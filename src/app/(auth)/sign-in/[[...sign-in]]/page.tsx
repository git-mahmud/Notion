import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Notion Clone",
};

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none w-full",
          headerTitle: "text-xl font-bold",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "border border-input bg-background hover:bg-accent text-foreground",
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          footerActionLink: "text-primary hover:text-primary/80",
          formFieldInput: "border-input",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
        },
      }}
      forceRedirectUrl="/documents"
      signUpUrl="/sign-up"
    />
  );
}
