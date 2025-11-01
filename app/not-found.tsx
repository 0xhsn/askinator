import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-primary">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-muted-foreground">
            This page could not be found.
          </p>
          <Button asChild>
            <Link href="/" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go back home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
