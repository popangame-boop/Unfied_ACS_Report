import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="text-center bg-card p-8 rounded-xl shadow-subtle">
        <CardHeader>
          <CardTitle className="text-4xl font-bold mb-4 text-foreground">404</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
          <Link to="/">
            <Button className="bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;