"use client";

import { useState } from "react";
import { toast } from "sonner";

import { submitVerificationDocuments, logUploadAttempt } from "@/app/(onboarding)/onboarding/actions";
import { uploadVerificationDocument } from "@/lib/supabase/storage-upload";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";

async function uploadAndLog(
  file: File,
  userId: string,
  docType: "business_proof" | "id_proof"
): Promise<string> {
  try {
    const result = await uploadVerificationDocument(file, userId, docType);
    void logUploadAttempt(docType, true);
    return result;
  } catch (err) {
    void logUploadAttempt(docType, false, err instanceof Error ? err.message : "Upload failed");
    throw err;
  }
}

export function VerificationForm({
  userId,
  onSubmitted,
}: {
  userId: string;
  onSubmitted: () => void;
}) {
  const [businessProof, setBusinessProof] = useState<string | null>(null);
  const [idProof, setIdProof] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!businessProof || !idProof) {
      toast.error("Upload both documents to continue");
      return;
    }
    setSubmitting(true);
    const result = await submitVerificationDocuments({
      business_proof_url: businessProof,
      id_proof_url: idProof,
    });
    setSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Documents submitted for verification");
    onSubmitted();
  }

  return (
    <div className="space-y-5">
      <FileUpload
        label="Business proof"
        helperText="Certificate of incorporation, GST certificate, etc."
        value={businessProof}
        onUpload={(file) => uploadAndLog(file, userId, "business_proof")}
        onUploaded={setBusinessProof}
      />
      <FileUpload
        label="ID proof"
        helperText="PAN card, Aadhaar, passport, etc."
        value={idProof}
        onUpload={(file) => uploadAndLog(file, userId, "id_proof")}
        onUploaded={setIdProof}
      />
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={submitting || !businessProof || !idProof}
      >
        {submitting ? "Submitting..." : "Submit for verification"}
      </Button>
    </div>
  );
}
