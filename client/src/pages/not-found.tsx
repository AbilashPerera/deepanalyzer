import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-card-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-10 pb-8 text-center">
          <div className="text-8xl font-bold font-display gradient-text mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button data-testid="button-go-home">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" data-testid="button-explore">
                <Search className="w-4 h-4 mr-2" />
                Explore Projects
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
