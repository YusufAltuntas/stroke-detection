"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Upload, X, FileImage } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type UploadState = {
  file: File
  previewUrl: string
} | null

export function UploadDropzone({
  value,
  onChange,
}: {
  value: UploadState
  onChange: (s: UploadState) => void
}) {
  const [drag, setDrag] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined | null) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    onChange({ file, previewUrl: url })
  }

  const reset = () => {
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  React.useEffect(() => {
    return () => {
      if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[120px_1fr] items-center gap-4 p-3">
          <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
            {/* using <img> instead of next/image to support blob: previews without config */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.previewUrl}
              alt={value.file.name}
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <FileImage className="size-3.5 text-muted-foreground" />
              <span className="truncate font-mono-tnum text-xs text-foreground">
                {value.file.name}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {(value.file.size / 1024).toFixed(0)} KB · {value.file.type || "image"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Degistir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-muted-foreground"
              >
                <X className="size-3.5" /> Kaldir
              </Button>
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    )
  }

  return (
    <motion.label
      htmlFor="upload-input"
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-card/40 px-6 py-10 text-center transition-all",
        drag
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-card"
      )}
      whileHover={{ scale: 1.005 }}
    >
      <div
        className={cn(
          "grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary/15 to-accent/15 text-primary transition-transform",
          drag && "scale-110"
        )}
      >
        <Upload className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          MR-DWI goruntusunu surukle veya sec
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          JPEG · PNG · DICOM kesit gorseli · maks. 10 MB
        </p>
      </div>
      <input
        id="upload-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </motion.label>
  )
}
