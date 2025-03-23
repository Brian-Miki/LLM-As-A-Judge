import { ConfigurationForm } from "@/components/ConfigurationForm";

export default function ConfigurationPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Agent Configuration</h1>
      <ConfigurationForm />
    </div>
  );
} 