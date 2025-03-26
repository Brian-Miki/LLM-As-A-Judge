import { ConfigurationForm } from "@/components/ConfigurationForm";

export default function ConfigurationPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Agent Configuration</h1>
      <ConfigurationForm />
    </div>
  );
} 