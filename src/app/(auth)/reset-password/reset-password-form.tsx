"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { updatePasswordAction } from "@/actions/auth.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/types/auth";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialAuthActionState);

  return (
    <Card className="border-white/70 shadow-xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Buat password baru</CardTitle>
        <CardDescription>Gunakan minimal 8 karakter yang berisi huruf dan angka.</CardDescription>
      </CardHeader>
      <CardContent>
        {state.status === "success" ? (
          <div className="space-y-5 text-center">
            <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-primary" />
            <Alert className="border-primary/20 bg-primary/5 text-left">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
            <Button asChild className="h-11 w-full"><Link href="/login">Masuk kembali</Link></Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            {state.message ? (
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertDescription className="text-destructive">{state.message}</AlertDescription>
              </Alert>
            ) : null}
            {[
              ["password", "Password baru", "new-password"],
              ["confirmPassword", "Ulangi password baru", "new-password"],
            ].map(([name, label, autoComplete]) => (
              <div className="space-y-2" key={name}>
                <Label htmlFor={name}>{label}</Label>
                <div className="relative">
                  <LockKeyhole aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                  <Input autoComplete={autoComplete} className="pl-10" id={name} name={name} required type="password" />
                </div>
                {state.fieldErrors?.[name]?.map((message) => (
                  <p className="text-xs text-destructive" key={message}>{message}</p>
                ))}
              </div>
            ))}
            <Button className="h-11 w-full" disabled={pending} type="submit">
              {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <LockKeyhole aria-hidden="true" />}
              {pending ? "Menyimpan..." : "Simpan password baru"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

