import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, Users, Link, Zap } from "lucide-react";

import { useTodoList } from "../hooks/useTodoList";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function IndexPage() {
  const navigate = useNavigate();
  const { createList } = useTodoList("");
  const [loading, setLoading] = useState(false);

  const handleCreateList = async () => {
    try {
      setLoading(true);
      const listId = await createList("My Todo List");

      navigate(`/${listId}`);
    } catch (error) {
      console.error("Failed to create list:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-svh flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center text-center max-w-md space-y-8">
        {/* App Icon */}
        <div className="text-7xl">📝</div>

        {/* App Title */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">Noto</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Create todo lists and share them instantly. Work together in
            real-time.
          </p>
        </div>

        {/* Primary Action */}
        <Button
          className="text-lg px-8 py-6 rounded-full font-medium"
          disabled={loading}
          size="lg"
          onClick={handleCreateList}
        >
          {loading && <Spinner className="mr-2" />}
          {loading ? "Creating..." : "Create New List"}
        </Button>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-4">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            No sign-up required
          </span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="flex items-center gap-1.5">
            <Link className="w-4 h-4" />
            Share via link
          </span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Real-time collaboration
          </span>
        </div>
      </div>

      {/* Feature Cards (shown on larger screens) */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        <FeatureCard
          description="Group your tasks into logical categories"
          icon={<ListChecks className="w-5 h-5" />}
          title="Organize"
        />
        <FeatureCard
          description="Work together with your team in real-time"
          icon={<Users className="w-5 h-5" />}
          title="Collaborate"
        />
        <FeatureCard
          description="Changes sync automatically across devices"
          icon={<Zap className="w-5 h-5" />}
          title="Instant"
        />
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 text-center space-y-2">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto text-foreground">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
