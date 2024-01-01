export interface CADFile {
    path: string,
    commit: number,
    size: number,
    hash: string,
    s3key: string
};
  
export interface ProjectState {
    commit: number,
    files: CADFile[]
};

export interface DownloadInfo {
    path: string, // path to download to
    url: string, // presigned url
    key: string // s3 key
}