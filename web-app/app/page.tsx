import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Customer Support Scenario Lab</h1>
        </div>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
          Design and generate realistic test scenarios for your AI customer support agents
        </p>

        <div className="mb-12">
          <Link href="/onboarding">
            <Button size="lg" className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="max-w-xl space-y-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-primary font-medium">1</span>
              </div>
              <h2 className="text-xl font-semibold">Create Agent Profile</h2>
            </div>
            <p className="text-muted-foreground pl-10">
              Define your agent's capabilities, test scenarios, and user personas to establish evaluation criteria
            </p>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-primary font-medium">2</span>
              </div>
              <h2 className="text-xl font-semibold">Upload & Generate Data</h2>
            </div>
            <p className="text-muted-foreground pl-10">
              Upload your existing test data or generate new scenarios based on your agent's profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
