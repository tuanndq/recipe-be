export interface StoredFileInfo {
  filename: string;
  url: string;
}

export interface SaveImageResult extends StoredFileInfo {
  size: number;
}

export interface FileStorage {
  list(): Promise<StoredFileInfo[]>;
  saveImage(buffer: Buffer, originalName: string): Promise<SaveImageResult>;
  toPublicUrl(filename: string): string;
}
