"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CertificationCreation from "@/components/certification-creation";
import CertificationSection from "@/components/certification-section";


export default function CertificationPage() {
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/certifications");
      if (!response.ok) {
        throw new Error("Failed to fetch certifications");
      }
      const data = await response.json();
      setCertifications(data);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificationCreated = (newCertification: any) => {
    setCertifications((prev) => [...prev, newCertification]);
  };

  const handleCertificationUpdated = (updatedCertification: any) => {
    setCertifications((prev) =>
      prev.map((cert) => (cert.id === updatedCertification.id ? updatedCertification : cert)),
    );
  };

  const handleCertificationDeleted = (id: number) => {
    setCertifications((prev) => prev.filter((cert) => cert.id !== id));
  };

  return (
    <div className="mx-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Certifications</h1>
        <Button onClick={() => setIsCreationOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      <CertificationCreation
        isOpen={isCreationOpen}
        onClose={() => setIsCreationOpen(false)}
        onCertificationCreated={handleCertificationCreated}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          <p>{error}</p>
        </div>
      ) : (
        <CertificationSection
          certifications={certifications}
          onCertificationUpdated={handleCertificationUpdated}
          onCertificationDeleted={handleCertificationDeleted}
        />
      )}
    </div>
  );
}