//export all
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export type EmptyResponse = ApiResponse<null>;

export interface PermissionItem {
  key: string;
  name: string;
  actions: {
    read: boolean; // Xem
    create: boolean; // Thêm mới
    update: boolean; // Cập nhật
    delete: boolean; // Xoá
  };
}

export interface PermissionFormData {
  groupName: string;
  permissions: PermissionItem[];
}

export interface ChangePassForm {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface Difficulty extends DifficultyRequest {
  id: number;
}
export interface DifficultyRequest {
  difficultyName: string;
}

export interface User {
  id: number;
  code: string;
  username: string;
  fullName: string;
  email: string;
  roleId: number;
  phone: string;
  dateOfBirth: string; // ISO date string
  isFemale: boolean;
  ggid: string | null;
  avatarUrl: string | null;
  isStudent: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  lastLogin: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  courseGroups: CourseGroup[];
}

export interface AnswerOptionInput {
  optionContent: string;
  isCorrectAnswer: boolean;
}

export interface QuestionBase {
  subjectId: number;
  chapterId?: number | null;
  difficultyId?: number | null;
  creatorId: number;
  questionContent: string;
  answerExplanation?: string;
  defaultScore?: number;
  status?: "public" | "private" | "archive";
  answerOptions: AnswerOptionInput[];
}

export type QuestionCreate = QuestionBase;
export type QuestionUpdate = Partial<QuestionBase>;

export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  creditCount: number;
  theoryHours: number;
  practiceHours: number;
  isDeleted: number;

  courseGroups: CourseGroup[];
  chapters: Chapter[];
}

export interface Difficulty {
  id: number;
  difficultyName: string;
  createdAt?: string;
  updatedAt?: string;
}

export type QuestionStatus = "public" | "private" | "archive";
export interface Question {
  id: number;
  questionContent: string;
  imageUrl: string | null;
  answerExplanation: string;
  defaultScore: string;
  usageCount: number;
  status: QuestionStatus;
  isDeleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;

  difficultyId: number;
  subjectId: number;
  chapterId: number | null;
  creatorId: number;

  examsCount: number;

  // relations
  subject: Subject | null;
  chapter: Chapter | null;
  difficulty: Difficulty | null;
  creator: User | null;
  answerOptions: AnswerOption[];

  selectedAnswer?: number | null;
}

export interface AnswerOption {
  id: number;
  optionContent: string;
  isCorrectAnswer: boolean;
  questionId: number | null;
}

export interface Role {
  id: number;
  roleName: string;
  /** Trạng thái xóa: 0 là chưa xóa, 1 là đã xóa */
  isDeleted: number;
  /** Định dạng ISO 8601 */
  createdAt: string;
  /** Định dạng ISO 8601 */
  updatedAt: string;
  /** Tổng số người dùng thuộc nhóm quyền này */
  totalUsers: number;
}

export interface RoleBase {
  roleName: string;
  roleDetails: RoleDetailItem[];
}

export type RoleCreate = RoleBase;

export interface RoleResponse extends RoleBase {
  id: number;
}

export interface RoleDetail extends RoleBase {
  id: number;
}

export type RoleUpdate = Partial<RoleBase>;

export interface RoleDetailItem {
  functionName: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface UserBase {
  fullName: string;
  email: string;
  roleId: number | null;
  phone?: string | null;
  username: string;
  dateOfBirth: string; // ISO date string
  isFemale: boolean;
  ggid?: boolean | null;
  avatarUrl?: string | null;
  isLocked: boolean;
  isStudent: boolean;
}

export interface UserCreate extends UserBase {
  password: string;
}

export type UserUpdate = Partial<UserBase>;

export interface UserResponse extends UserBase {
  id: number;
}

export interface UserResetPass {
  newPassword: string;
  newPasswordConfirmation?: string;
}

export interface SubjectWithGroup {
  id: number;
  subjectCode: string;
  subjectName: string;
  creditCount: number;
  theoryHours: number;
  practiceHours: number;
  isDeleted: number;
  courseGroups: CourseGroup[];
}

export interface Chapter {
  id: number;
  chapterName: string;
  subjectId: number;
  isDeleted: number; // hoặc boolean nếu backend trả về true/false
}

export interface SubjectWithChapters {
  id: number;
  subjectCode: string;
  subjectName: string;
  creditCount: number;
  theoryHours: number;
  practiceHours: number;
  isDeleted: number; // hoặc boolean
  chapters: Chapter[];
}

export interface StudentExamResponse {
  exams: StudentExam[];
}

export interface StudentExamResponse {
  exams: StudentExam[];
}

export interface StudentExam {
  id: number;
  subjectId: number;
  examName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: number;

  examAttempt: ExamAttempt | null;
}

export interface AssignmentRequest {
  teacherId: number | null;
  subjectIds: number[];
}

export interface TeacherSubject {
  teacherId: number;
  subjectId: number;
  subject: Subject;
  teacher: User;
}

export interface Exam {
  id: number;
  subjectId: number;
  examName: string;
  /** Chuỗi định dạng ISO 8601 (e.g., "2026-03-23T19:22:00.000000Z") */
  startTime: string;
  /** Chuỗi định dạng ISO 8601 */
  endTime: string;
  /** Thời gian làm bài tính bằng phút */
  durationMinutes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: number;

  // Bạn có thể thêm các trường quan hệ (relations) nếu sau này fetch kèm
  subject: Subject;
  creator?: User;
  pivot?: {
    courseGroupId: number;
    examId: number;
  };

  courseGroups: CourseGroup[];

  questions: Question[];

  examConfiguration: ExamConfiguration;
}

// Nếu bạn muốn định nghĩa trạng thái đề thi (kết hợp với utils trước đó)
export type ExamStatusType = "UPCOMING" | "OPENING" | "CLOSED";

export interface StatusResult {
  label: string;
  status: ExamStatusType;
}

export interface NotificationBase {
  title: string;
  content: string;
  senderId: number;
}

export interface NotificationCreate extends NotificationBase {
  courseGroupIds: number[];
}

export type NotificationUpdate = Partial<NotificationCreate>;

export interface NotificationResponse extends NotificationBase {
  id: number;
  courseGroups: CourseGroup[];
  sentAt: string;
  priority: PriorityLevel;
  status: boolean;
  sender: User;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  sentAt: string;
  priority: PriorityLevel;
  status: boolean;
  senderId: number;
  sender: User;
}

// Gợi ý thêm Type cho các mức độ ưu tiên để dễ dùng trong Code
export type PriorityLevel = 1 | 2 | 3;

export interface CourseGroupJoinGroup {
  studentId: number;
  joinCode: string;
}

export interface CourseGroupDetailStudent {
  id: number;
  groupName: string;
  notifications: Notification[];
  exams: Exam[];
  students: User[];
  teacher: User;
}

export type BackendErrors = {
  [key: string]: string[];
};

export type ErrorResponse = {
  message?: string;
  errors: BackendErrors;
};

export interface GoogleUser {
  username: string | null;
  email: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: GoogleUser;
  error?: string;
}

export interface LoginFormSubmit {
  login: string;
  password: string;
}

export interface LoginResponse {
  original: {
    accessToken: string;
    me: User;
    role: RoleResponse;
  };
}

export type SidebarItem = {
  icon: string;
  labelKey: string;
  to: string;
  permission: string;
};

export type SidebarSection = {
  title: string | null;
  items: SidebarItem[];
};
export interface StudentRecord {
  id: number;
  stt: number;
  fullName: string;
  email: string;
  studentCode: string;
  gender: string;
  dateOfBirth: string;
  avatarUrl: string;
}

export interface CourseGroup {
  id: number;
  groupName: string;
  joinCode: string;
  studentCount: number | null;
  notes: string | null;
  semester: number;
  academicYear: number;
  teacherId: number | null;
  isHidden: boolean;
  isDeleted: boolean;
  subjectId: number;
  createdAt?: string;
  updatedAt?: string;
  // Dữ liệu quan hệ Many-to-Many (có thể không luôn có)
  pivot?: {
    studentId: number;
    courseGroupId: number;
  };
  // Dữ liệu lồng (Eager Loading từ Backend)
  // giang_vien: TaiKhoan;
  // mon_hoc: Subject;
  // backgroundUrl: "https://picsum.photos/1920/1080?blur=8";
  teacher?: User;
  subject?: Subject;
  backgroundUrl?: string;
}

export interface CourseGroupBase {
  subjectId: number;
  groupName: string;
  notes: string | null;
  semester: number;
  academicYear: number;
  teacherId: number | null;
  isHidden: boolean;
  isDeleted: boolean;
}

export type CourseGroupCreate = CourseGroupBase;

export type CourseGroupUpdate = Partial<CourseGroupBase>;

export interface CourseGroupStudentsResponse {
  students: User[];
}
export interface ExamConfiguration {
  examConfigurationId: number;
  examId: number;
  hasMonitoring: boolean;
  allowCopy: boolean;
  allowPrint: boolean;
  isEnableResume: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showScore: boolean;
  showDetailResults: boolean;
  isLimitSwitchTab: boolean;
  tabSwitchLimit: number;
  messageOnWarning: string; // Có thể null theo JSON của bạn
  limitQuestionsPerPage: number;
  allowBackLastQuestion: number;
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface Option {
  label: string;
  value: number | string;
}

export type ExamStatus = "IN_PROGRESS" | "SAVED" | "SUBMITTED" | "CANCELLED"; // Bạn có thể thêm các status khác nếu có

export interface ExamAttempt {
  id: number;
  startTime?: string; // ISO String
  submissionTime?: string | null; // ISO String hoặc null nếu chưa nộp
  totalScore: number | null; // null nếu chưa chấm
  correctAnswerCount: number | null; // null nếu chưa có kết quả
  status: ExamStatus;
  createdAt?: string;
  updatedAt?: string;
  studentId: number;
  student?: User;
  examId: number;
  exam?: Exam;
  examAttemptAnswers?: ExamAttemptAnswer[];
  examAttemptLog?: ExamAttemptLog;
}

export interface ExamAttemptAnswer {
  examAttemptId: number;
  questionId: number;
  answerOptionId: number | null; // ID của đáp án sinh viên chọn
  isSelectedCorrect: boolean; // Server sẽ update cái này khi nộp bài
  score: number;
  updatedAt: string;
}

export interface ExamAttemptLog {
  examAttemptLogId: number;
  examAttemptId: number;
  tabSwitchCount: number;
  createdAt: string; //iso string
}

export interface CreateExamPayload {
  subjectId: number;
  creatorId: number;
  examName: string;
  startTime: string; // Định dạng "YYYY-MM-DD HH:mm:ss"
  endTime: string;
  durationMinutes: number;
  courseGroupIds: number[]; // Khác với NhomHocPhan[]
  questions: {
    id: number;
    questionOrder: number;
    score: number;
  }[];
  // Lưu ý: Tên trường phải khớp với JSON là "cauHinh"
  examConfiguration: Omit<
    ExamConfiguration,
    "examConfigurationId" | "examId" | "createdAt" | "updatedAt"
  >;
}

export interface ExamResponseData {
  examAttempt: ExamAttempt;
  exam: Exam;
  questions: Question[];
}
export interface StudentResult extends User {
  courseGroup?: CourseGroup; // Thông tin nhóm
  examAttempt?: ExamAttempt; // Thông tin bài thi (nếu đã làm)
  isAverage?: boolean; // Đánh dấu dòng trung bình
}

export interface ExamReviewResponse {
  exam: Exam;
  examAttempts: { examAttempt: ExamAttempt; questions: Question[] }[];
}

export interface Chapter {
  id: number;
  chapterName: string;
  subjectId: number;
}

export interface ChapterItemRequest {
  chapterName: string;
}

export interface ChapterListRequest {
  chapters: ChapterItemRequest[];
}
