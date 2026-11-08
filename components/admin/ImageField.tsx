"use client";

import { useEffect, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageField({ current }: { current?: string }) {
  const [pathValue, setPathValue] = useState(current ?? "");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState(false);
  const preview = fileUrl || pathValue.trim();

  useEffect(() => {
    setBroken(false);
  }, [preview]);

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileUrl(null);
      setError("");
      return;
    }
    if (!TYPES.includes(file.type)) {
      event.target.value = "";
      setFileUrl(null);
      setError("Upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      event.target.value = "";
      setFileUrl(null);
      setError("Image must be under 5 MB.");
      return;
    }
    setError("");
    setFileUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  }

  return (
    <div className="imageField wide">
      <div className="imagePreview">
        {preview && !broken ? (
          <img src={preview} alt="" onError={() => setBroken(true)} />
        ) : (
          <span>{broken ? "Preview unavailable" : "No image yet"}</span>
        )}
      </div>
      <div className="stack">
        <label>
          Image path
          <input
            name="image"
            value={pathValue}
            onChange={(event) => setPathValue(event.target.value)}
            placeholder="/facebook/filatec-200w.jpg"
          />
        </label>
        <label>
          Or upload an image
          <input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
        </label>
        <small className="imageHint">JPG, PNG, or WebP. Maximum 5 MB.</small>
        {error ? <p className="notice error">{error}</p> : null}
      </div>
    </div>
  );
}
