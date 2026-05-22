'use client';

import useFilesStore from '@/Store/user/filesStore';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UploadCloud, FileText, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSuggestions } from '@/hooks/useSuggestions';

const uploadSchema = z
  .object({
    title: z.string().min(3, 'Title is too short'),
    univ: z.string().min(2, 'Please select a university'),
    major: z.string().min(2, 'Please select a major'),
    academic_year: z.string().min(2, 'Please select an academic year'),
    specialty: z.string().optional(),
    subject: z.string().min(3, 'Subject name is too short'),
    type: z.string().min(2, 'Please select a file type'),
    creation_year: z.string().regex(/^\d{4}$/, 'Must be a 4-digit year'),
  })
  .refine(
    (data) => {
      if (['M1', 'M2'].includes(data.academic_year)) {
        return !!data.specialty && data.specialty.length >= 2;
      }
      return true;
    },
    {
      message: 'Specialty is required for Master years',
      path: ['specialty'],
    }
  );

type UploadFormValues = z.infer<typeof uploadSchema>;

function UploadFileBtn({
  variant = 'default',
}: {
  variant?: 'default' | 'sidebar';
}) {
  const { UplodeNewFile, loading } = useFilesStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      type: 'COURS',
      academic_year: 'L1',
      creation_year: new Date().getFullYear().toString(),
    },
  });

  const { suggestions, fetchSuggestions, clearSuggestions } = useSuggestions();
  const [activeSearchField, setActiveSearchField] = useState<string | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values: UploadFormValues) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', values.title);
    formData.append('univ', values.univ);
    formData.append('major', values.major);
    formData.append('academic_year', values.academic_year);

    // Only send specialty if it's M1 or M2 (required by backend schema)
    if (['M1', 'M2'].includes(values.academic_year) && values.specialty) {
      formData.append('specialty', values.specialty);
    }

    formData.append('subject', values.subject);
    formData.append('type', values.type);
    formData.append('creation_year', values.creation_year);

    const result = await UplodeNewFile(formData);

    if (result.success) {
      toast.success(
        'File uploaded successfully! It will be reviewed by admins.'
      );
      setIsOpen(false);
      reset();
      setSelectedFile(null);
    } else {
      toast.error(result.message || 'Failed to upload file');
    }
  };

  const handleSearch = (
    field: 'univ' | 'major' | 'specialty' | 'subject',
    value: string
  ) => {
    setValue(field as any, value);
    setActiveSearchField(field);

    const extra: any = {};
    if (field === 'major') extra.univ = watch('univ');
    if (field === 'specialty') {
      extra.univ = watch('univ');
      extra.major = watch('major');
      extra.year = watch('academic_year');
    }
    if (field === 'subject') {
      extra.univ = watch('univ');
      extra.major = watch('major');
      extra.year = watch('academic_year');
      extra.specialization = watch('specialty');
    }

    fetchSuggestions(field, value, extra);
  };

  if (!mounted) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-3 w-full cursor-pointer">
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">Upload File</span>
        </div>
      );
    }
    return (
      <Button className="bg-[#0975e6] hover:bg-[#0866c9] text-white gap-2 rounded-xl px-6 py-6 shadow-lg shadow-[#0975e6]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <UploadCloud className="w-5 h-5" />
        <span className="font-bold">Upload New File</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === 'sidebar' ? (
          <div className="flex items-center gap-3 w-full cursor-pointer">
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">Upload File</span>
          </div>
        ) : (
          <Button className="bg-[#0975e6] hover:bg-[#0866c9] text-white gap-2 rounded-xl px-6 py-6 shadow-lg shadow-[#0975e6]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <UploadCloud className="w-5 h-5" />
            <span className="font-bold">Upload New File</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2rem] bg-[#f8f6f6] dark:bg-[#221610] shadow-2xl">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Share Your Knowledge
          </DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Upload your summaries, exams, or course materials.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-6">
          {/* File Dropzone */}
          <div className="relative">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">
              Document File
            </Label>
            <div
              className={`
                relative border-2 border-dashed rounded-[1.5rem] p-8 transition-all
                ${
                  selectedFile
                    ? 'border-[#0975e6] bg-[#0975e6]/5'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-[#0975e6]/50 hover:bg-[#0975e6]/5'
                }
              `}
            >
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              <div className="flex flex-col items-center justify-center text-center">
                {selectedFile ? (
                  <>
                    <div className="size-14 bg-[#0975e6] rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-[#0975e6]/20">
                      <FileText className="text-white w-7 h-7" />
                    </div>
                    <p className="text-slate-900 dark:text-white font-bold max-w-[200px] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="size-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                      <UploadCloud className="text-slate-400 w-7 h-7" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-bold">
                      Click or drag to upload
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, DOCX, PNG up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Document Title
              </Label>
              <Input
                {...register('title')}
                placeholder="Ex: Calculus I Exam 2023"
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6]"
              />
              {errors.title && (
                <p className="text-red-500 text-[10px] font-bold uppercase">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Creation Year */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Year of Creation
              </Label>
              <Input
                {...register('creation_year')}
                placeholder="2023"
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6]"
              />
              {errors.creation_year && (
                <p className="text-red-500 text-[10px] font-bold uppercase">
                  {errors.creation_year.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* University */}
            <div className="space-y-2 relative">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                University
              </Label>
              <Input
                value={watch('univ') || ''}
                onChange={(e) => handleSearch('univ', e.target.value)}
                autoComplete="off"
                placeholder="Search University..."
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6]"
              />
              {activeSearchField === 'univ' &&
                (suggestions.length > 0 || loading) && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium border-b border-slate-50 dark:border-slate-800 last:border-none"
                          onClick={() => {
                            setValue('univ', s);
                            clearSuggestions();
                            setActiveSearchField(null);
                          }}
                        >
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                )}
              {errors.univ && (
                <p className="text-red-500 text-[10px] font-bold uppercase">
                  {errors.univ.message}
                </p>
              )}
            </div>

            {/* Major */}
            <div className="space-y-2 relative">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Major
              </Label>
              <Input
                value={watch('major') || ''}
                onChange={(e) => handleSearch('major', e.target.value)}
                autoComplete="off"
                placeholder="Ex: Computer Science"
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6]"
              />
              {activeSearchField === 'major' &&
                (suggestions.length > 0 || loading) && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium border-b border-slate-50 dark:border-slate-800 last:border-none"
                          onClick={() => {
                            setValue('major', s);
                            clearSuggestions();
                            setActiveSearchField(null);
                          }}
                        >
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                )}
              {errors.major && (
                <p className="text-red-500 text-[10px] font-bold uppercase">
                  {errors.major.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Year */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Academic Year
              </Label>
              <Select
                onValueChange={(val) => {
                  setValue('academic_year', val);
                  if (!['M1', 'M2'].includes(val)) {
                    setValue('specialty', '');
                    clearSuggestions();
                  }
                }}
                defaultValue="L1"
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="L1">First Year (L1)</SelectItem>
                  <SelectItem value="L2">Second Year (L2)</SelectItem>
                  <SelectItem value="L3">Third Year (L3)</SelectItem>
                  <SelectItem value="M1">Master 1 (M1)</SelectItem>
                  <SelectItem value="M2">Master 2 (M2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Document Type
              </Label>
              <Select
                onValueChange={(val) => setValue('type', val)}
                defaultValue="COURS"
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="COURS">Course</SelectItem>
                  <SelectItem value="TD">TD / Exercices</SelectItem>
                  <SelectItem value="TP">TP / Practical</SelectItem>
                  <SelectItem value="EF">Final Exam (EF)</SelectItem>
                  <SelectItem value="CC">Test (CC)</SelectItem>
                  <SelectItem value="RESUME">Summary</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specialty */}
            <div className="space-y-2 relative">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Specialty (Optional)
              </Label>
              <Input
                value={watch('specialty') || ''}
                onChange={(e) => handleSearch('specialty', e.target.value)}
                onFocus={() =>
                  handleSearch('specialty', watch('specialty') || '')
                }
                autoComplete="off"
                placeholder={
                  ['M1', 'M2'].includes(watch('academic_year'))
                    ? 'Ex: AI, Software Engineering'
                    : 'Only for Master years'
                }
                disabled={!['M1', 'M2'].includes(watch('academic_year'))}
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6] disabled:opacity-50"
              />
              {activeSearchField === 'specialty' &&
                (suggestions.length > 0 || loading) && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium border-b border-slate-50 dark:border-slate-800 last:border-none"
                          onClick={() => {
                            setValue('specialty', s);
                            clearSuggestions();
                            setActiveSearchField(null);
                          }}
                        >
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                )}
            </div>

            {/* Subject */}
            <div className="space-y-2 relative">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Subject / Module
              </Label>
              <Input
                value={watch('subject') || ''}
                onChange={(e) => handleSearch('subject', e.target.value)}
                autoComplete="off"
                placeholder="Ex: Mathematics 1"
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6]"
              />
              {activeSearchField === 'subject' &&
                (suggestions.length > 0 || loading) && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium border-b border-slate-50 dark:border-slate-800 last:border-none"
                          onClick={() => {
                            setValue('subject', s);
                            clearSuggestions();
                            setActiveSearchField(null);
                          }}
                        >
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                )}
              {errors.subject && (
                <p className="text-red-500 text-[10px] font-bold uppercase">
                  {errors.subject.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0975e6] hover:bg-[#0866c9] text-white py-8 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#0975e6]/20 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Submit Document'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UploadFileBtn;
