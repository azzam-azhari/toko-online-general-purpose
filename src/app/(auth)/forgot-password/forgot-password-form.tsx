"use client";

import { useActionState } from "react";
import { ArrowLeft, LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";

import { forgotPasswordAction } from "@/actions/auth.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/types/auth";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialAuthActionState);

  return (
    <Card className="border-white/70 shadow-xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Pulihkan password</CardTitle>
        <CardDescription>Kami akan mengirim tautan aman jika email terdaftar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={formAction} className="space-y-5">
          {state.message ? (
            <Alert className={state.status === "success" ? "border-primary/20 bg-primary/5" : "border-destructive/30 bg-destructive/5"}>
              <AlertDescription className={state.status === "error" ? "text-destructive" : undefined}>
                {state.message}
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email admin</Label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input autoComplete="email" className="pl-10" id="email" name="email" required type="email" />
            </div>
            {state.fieldErrors?.email?.map((message) => (
              <p className="text-xs text-destructive" key={message}>{message}</p>
            ))}
          </div>
          <Button className="h-11 w-full" disabled={pending} type="submit">
            {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Mail aria-hidden="true" />}
            {pending ? "Mengirim..." : "Kirim tautan pemulihan"}
          </Button>
        </form>
        <Button asChild className="w-full" variant="ghost">
          <Link href="/login"><ArrowLeft aria-hidden="true" /> Kembali ke halaman masuk</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

