export interface SongResult {
  position: number;
  judul: string;
  lirik: string;
  sunoPrompt: string;
  catatan: string;
}

export interface SingleResult {
  judul: string;
  lirik: string;
  sunoPrompt: string;
  catatan: string;
  raw: string;
}
