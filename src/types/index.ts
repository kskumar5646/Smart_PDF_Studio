export type ToolCategory =
  | 'All'
  | 'PDF'
  | 'Convert'
  | 'Edit'
  | 'Organize'
  | 'Security'
  | 'Create'
  | 'Image'
  | 'Utilities';

export type InputFileType = 'pdf' | 'image' | 'multiple-pdf' | 'multiple-images' | 'text' | 'form' | 'none';

export type OutputFileType = 'pdf' | 'image' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'zip' | 'svg' | 'info';

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  shortDescription: string;
  iconName: string;
  popular?: boolean;
  inputType: InputFileType;
  outputType: OutputFileType;
  keywords: string[];
}

export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'de'
  | 'es'
  | 'fr'
  | 'pt'
  | 'ru'
  | 'ar'
  | 'zh'
  | 'ja';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  stageMessage: string;
  errorMessage?: string;
  resultUrl?: string;
  resultFileName?: string;
  resultSize?: number;
  originalSize?: number;
  extractedText?: string;
  previewUrl?: string;
}
