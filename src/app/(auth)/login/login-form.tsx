"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";

import { loginAction } from "@/actions/auth.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/types/auth";

type LoginFormProps = {
  nextPath?: string;
  notice?: string;
};

export function LoginForm({ nextPath, notice }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialAuthActionState);

  return (
    <Card className="border-white/70 shadow-xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Masuk ke dashboard</CardTitle>
        <CardDescription>Kelola toko dengan akun admin NusaMart Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {nextPath ? <input name="next" type="hidden" value={nextPath} /> : null}
          {notice ? (
            <Alert className="border-primary/20 bg-primary/5">
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === "error" ? (
            <Alert className="border-destructive/30 bg-destructive/5">
              <AlertDescription className="text-destructive">{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                autoComplete="email"
                className="pl-10"
                id="email"
                name="email"
                placeholder="admin@toko.com"
                required
                type="email"
              />
            </div>
            {state.fieldErrors?.email?.map((message) => (
              <p className="text-xs text-destructive" key={message}>{message}</p>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>
              <Link className="text-xs font-semibold text-primary hover:underline" href="/forgot-password">
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                autoComplete="current-password"
                className="pl-10"
                id="password"
                name="password"
                placeholder="Masukkan password"
                required
                type="password"
              />
            </div>
            {state.fieldErrors?.password?.map((message) => (
              <p className="text-xs text-destructive" key={message}>{message}</p>
            ))}
          </div>

          <Button className="h-11 w-full" disabled={pending} type="submit">
            {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <ArrowRight aria-hidden="true" />}
            {pending ? "Memeriksa akun..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

