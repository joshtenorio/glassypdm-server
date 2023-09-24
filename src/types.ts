export interface CADFile {
    path: string,
    commit: number,
    size: number,
    hash: string,
};
  
export interface ProjectState {
    commit: number,
    files: CADFile[]
};