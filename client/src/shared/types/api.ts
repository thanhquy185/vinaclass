export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export type EmptyResponse = ApiResponse<null>;

export type BackendErrors = {
  [key: string]: string[];
};

export type ErrorResponse = {
  message?: string;
  errors: BackendErrors;
};
