"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { NAV_CATEGORIES } from "@/lib/categories";

export default function UploadPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState([]); // array of selected tag strings
  const [customTag, setCustomTag] = useState(""); // for typing a new custom tag
  const [accessDuration, setAccessDuration] = useState("6");
  
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [thumbnails, setThumbnails] = useState([]);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  
  const [status, setStatus] = useState("idle"); // idle, uploading, submitting, success, error
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMsg("Invalid file type. Only PDF, PNG, JPEG, and WEBP are allowed.");
      return;
    }
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMsg("File size exceeds 50MB limit.");
      return;
    }
    
    setErrorMsg("");
    setFile(selectedFile);
  };

  const handleThumbnailDragOver = (e) => {
    e.preventDefault();
    setIsDraggingThumbnail(true);
  };

  const handleThumbnailDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
  };

  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddThumbnails(Array.from(e.dataTransfer.files));
    }
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddThumbnails(Array.from(e.target.files));
    }
  };

  const validateAndAddThumbnails = (selectedFiles) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const validFiles = [];
    
    for (const f of selectedFiles) {
      if (!allowedTypes.includes(f.type)) {
        setErrorMsg("Invalid thumbnail type. Only PNG, JPEG, and WEBP are allowed.");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrorMsg(`File ${f.name} exceeds 5MB limit.`);
        return;
      }
      validFiles.push(f);
    }
    
    setErrorMsg("");
    setThumbnails(prev => {
      const combined = [...prev, ...validFiles];
      return combined.slice(0, 3); // Limit to 3 images
    });
  };

  const handlePublish = async () => {
    if (!title || !subject || !price || !file) {
      setErrorMsg("Please fill in all required fields and select a manuscript file.");
      return;
    }

    try {
      setStatus("uploading");
      setErrorMsg("");

      // 1. Upload Manuscript File
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/notes/admin/upload", {
        method: "POST",
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "File upload failed");
      }

      // 2. Upload Thumbnails
      const uploadedThumbnailUrls = [];
      for (const thumb of thumbnails) {
        const thumbFormData = new FormData();
        thumbFormData.append("file", thumb);
        const thumbRes = await fetch("/api/notes/admin/upload", {
          method: "POST",
          body: thumbFormData,
        });
        const thumbData = await thumbRes.json();
        if (!thumbRes.ok) {
          throw new Error(thumbData.error || "Thumbnail upload failed");
        }
        uploadedThumbnailUrls.push(thumbData.path);
      }

      // 3. Submit Note Metadata
      setStatus("submitting");
      
      const notePayload = {
        title,
        subject,
        price: parseFloat(price),
        tags: tags,
        accessDurationMonths: parseInt(accessDuration),
        fileUrl: uploadData.path,
        thumbnailUrls: uploadedThumbnailUrls,
        status: "published"
      };

      const noteRes = await fetch("/api/notes/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notePayload),
      });

      const noteData = await noteRes.json();

      if (!noteRes.ok) {
        throw new Error(noteData.error || "Failed to create note");
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/admin/notes");
      }, 2000);

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center mb-10 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-container-high rounded-xl transition-all text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="font-headline italic text-2xl tracking-tight text-green-900 font-bold">
            Archiving New Materials
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          >
            Discard Draft
          </button>
          <div className="h-4 w-px bg-outline-variant/30"></div>
          <button 
            onClick={handlePublish}
            disabled={status !== "idle" && status !== "error"}
            className="bg-signature-gradient text-on-primary px-6 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 shadow-sm shadow-primary/20 hover:shadow-md disabled:opacity-50 disabled:pointer-events-none"
          >
            {status === "uploading" ? "Uploading..." : status === "submitting" ? "Publishing..." : status === "success" ? "Published!" : "Publish"}
          </button>
        </div>
      </header>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {errorMsg}
        </div>
      )}

      {status === "success" && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          Successfully published note! Redirecting...
        </div>
      )}

      <section className="flex items-start justify-center bg-surface animate-slide-up">
        <div className="w-full max-w-3xl space-y-12 pb-20">
          <div className="max-w-xl">
            <h3 className="font-headline text-4xl text-primary mb-4 font-bold">
              Note Details
            </h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Ensure all metadata is cataloged correctly to maintain library
              integrity. High-quality scans and accurate subjects increase
              discoverability for researchers.
            </p>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Note Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-3 font-headline text-xl text-primary placeholder:text-stone-300 transition-all outline-none"
                  placeholder="e.g. Advanced Macroeconomics Week 4"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Subject
                </label>
                <div className="relative">
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-3 font-body text-on-surface appearance-none outline-none cursor-pointer"
                  >
                    <option value="">Select a Discipline</option>
                    {NAV_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.subject}>{c.label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-3 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Price (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-3 text-on-surface-variant font-medium">
                    ₹
                  </span>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 pl-4 pr-0 py-3 font-body text-on-surface placeholder:text-stone-300 transition-all outline-none"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Tags &amp; Keywords
                </label>

                {/* Preset tags */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Physics", "Chemistry", "Biology", "Maths", "English",
                    "Hindi", "History", "Geography", "Economics", "CS",
                    "Organic", "Inorganic", "Mechanics", "Thermodynamics",
                    "NEET Prep", "JEE Prep", "Handwritten", "Short Notes",
                  ].map((tag) => {
                    const selected = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          selected
                            ? "bg-primary text-on-primary border-primary shadow-sm"
                            : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        {selected && <span className="mr-1">✓</span>}
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tag entry */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === ",") && customTag.trim()) {
                        e.preventDefault();
                        const t = customTag.trim().replace(/,$/, "");
                        if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
                        setCustomTag("");
                      }
                    }}
                    className="flex-1 bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-2 font-body text-sm text-on-surface placeholder:text-stone-300 outline-none"
                    placeholder="Type a custom tag and press Enter…"
                    type="text"
                  />
                  {customTag.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const t = customTag.trim();
                        if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
                        setCustomTag("");
                      }}
                      className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                      + Add
                    </button>
                  )}
                </div>

                {/* Selected tags summary */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-on-primary rounded-full text-[11px] font-bold"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                          className="hover:opacity-70 transition-opacity leading-none"
                          aria-label={`Remove ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70 flex items-center gap-2">
                  Access Duration
                  <span
                    className="material-symbols-outlined text-[14px] cursor-help opacity-60"
                    title="Sets when this content becomes unavailable"
                  >
                    info
                  </span>
                </label>
                <div className="relative">
                  <select 
                    value={accessDuration}
                    onChange={(e) => setAccessDuration(e.target.value)}
                    className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-3 font-body text-on-surface appearance-none outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {m} Month{m > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-3 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
                <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant opacity-60 mt-1">
                  Access will expire after the selected number of months from
                  the date of purchase.
                </p>
              </div>
              <div className="hidden md:block"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Manuscript Upload Area */}
              <div className="space-y-4">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Digital Manuscript
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="application/pdf,image/png,image/jpeg,image/webp" 
                />
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center border-2 border-dashed bg-surface-container-low rounded-xl p-10 h-64 transition-all cursor-pointer ${
                    isDragging ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container-high/50 hover:border-primary/30"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <span
                      className={`material-symbols-outlined text-3xl ${file ? "text-green-600" : "text-primary"}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {file ? "task" : "upload_file"}
                    </span>
                  </div>
                  <h4 className="font-headline text-lg text-primary text-center font-bold px-4 truncate w-full">
                    {file ? file.name : "Drag manuscript here"}
                  </h4>
                  <p className="font-body text-on-surface-variant text-xs mt-1 text-center">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "PDF, PNG, JPG (Max 50MB)"}
                  </p>
                  <button className="mt-4 bg-surface-container-lowest text-on-surface-variant px-6 py-1.5 rounded-lg font-label text-[10px] uppercase tracking-widest hover:text-primary hover:shadow-md transition-all ghost-border" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    {file ? "Change File" : "Select File"}
                  </button>
                </div>
              </div>

              {/* Thumbnail Upload Area */}
              <div className="space-y-4">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70 flex justify-between">
                  <span>Product Thumbnails (Max 3)</span>
                  {thumbnails.length > 0 && <span>{thumbnails.length}/3</span>}
                </label>
                
                <input 
                  type="file" 
                  ref={thumbnailInputRef} 
                  onChange={handleThumbnailChange} 
                  className="hidden" 
                  multiple
                  accept="image/png,image/jpeg,image/webp" 
                />
                
                <div 
                  onDragOver={handleThumbnailDragOver}
                  onDragLeave={handleThumbnailDragLeave}
                  onDrop={handleThumbnailDrop}
                  onClick={() => thumbnails.length < 3 && thumbnailInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center border-2 border-dashed bg-surface-container-low rounded-xl p-6 h-64 transition-all ${
                    thumbnails.length >= 3 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    isDraggingThumbnail ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container-high/50 hover:border-primary/30"
                  }`}
                >
                  {thumbnails.length > 0 ? (
                    <div className="flex gap-2 mb-4 w-full justify-center overflow-hidden">
                      {thumbnails.map((t, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm">
                          <img src={URL.createObjectURL(t)} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setThumbnails(prev => prev.filter((_, idx) => idx !== i)); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                      <span
                        className="material-symbols-outlined text-3xl text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        add_photo_alternate
                      </span>
                    </div>
                  )}
                  <h4 className="font-headline text-sm text-primary text-center font-bold px-4 truncate w-full">
                    {thumbnails.length > 0 ? (thumbnails.length >= 3 ? "Max reached" : "Add more images") : "Drag thumbnails here"}
                  </h4>
                  <p className="font-body text-on-surface-variant text-xs mt-1 text-center">
                    PNG, JPG, WEBP (Max 5MB each)
                  </p>
                  {thumbnails.length < 3 && (
                    <button className="mt-4 bg-surface-container-lowest text-on-surface-variant px-6 py-1.5 rounded-lg font-label text-[10px] uppercase tracking-widest hover:text-primary hover:shadow-md transition-all ghost-border" onClick={(e) => { e.stopPropagation(); thumbnailInputRef.current?.click(); }}>
                      Select Images
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl ghost-border relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-signature-gradient rounded-l-xl"></div>
              <div className="flex items-start gap-6">
                <div className="w-24 h-32 bg-surface-container rounded-lg flex items-center justify-center overflow-hidden">
                  {thumbnails.length > 0 ? (
                    <img src={URL.createObjectURL(thumbnails[0])} alt="Preview" className="w-full h-full object-cover" />
                  ) : file && file.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline-variant text-3xl">
                      {file?.type === "application/pdf" ? "picture_as_pdf" : "image"}
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <h5 className="font-headline text-lg italic text-on-surface-variant">
                    {title || "Live Preview..."}
                  </h5>
                  <p className="text-sm text-on-surface-variant opacity-80">
                    {subject || "Subject pending"}
                  </p>
                  
                  {price && (
                    <div className="font-bold text-primary">
                      ₹{parseFloat(price).toFixed(2)}
                    </div>
                  )}
                  
                  {tags.length > 0 && (
                    <div className="flex gap-2 pt-3 flex-wrap">
                      {tags.map((t) => (
                        <div key={t} className="px-3 py-1 bg-secondary-fixed text-xs rounded-full">
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button 
              onClick={handlePublish}
              disabled={status !== "idle" && status !== "error"}
              className="bg-signature-gradient text-on-primary px-12 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">
                {status === "success" ? "check" : "publish"}
              </span>
              {status === "uploading" ? "Uploading..." : status === "submitting" ? "Publishing to Archives..." : status === "success" ? "Published!" : "Publish to Archives"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
