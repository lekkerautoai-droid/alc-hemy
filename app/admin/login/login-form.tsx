"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value;
                  trySubmit(value);
                }
              }}
            />
          </div>
          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-destructive">{error}</div>}
          <Button
            size="lg"
            className="w-full"
            disabled={pending}
            onClick={() => {
              const input = document.getElementById("password") as HTMLInputElement;
              trySubmit(input.value);
            }}
          >
            {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : "Sign in"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  function trySubmit(password: string) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(password);
      if (!result.ok) setError(result.error || "Wrong password");
    });
  }
}
