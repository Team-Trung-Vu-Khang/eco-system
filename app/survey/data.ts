import {
  BookText,
  CheckCircle2,
  CircleDot,
  Factory,
  MessageSquareQuote,
  ShoppingBag,
  SlidersHorizontal,
  Sprout,
  SquareCheckBig,
  Table2,
} from "lucide-react";
import {
  type SurveyQuestion,
  type SurveyQuestionType,
  type SurveyResultDetails,
} from "@/lib/survey";

export type SurveyTypeMeta = {
  id: number;
  key: "general" | "farm" | "factory" | "shop";
  name: string;
  description: string;
  icon: typeof BookText;
  accent: string;
  softAccent: string;
};

export const surveyTypes: SurveyTypeMeta[] = [
  {
    id: 396,
    key: "general",
    name: "Khảo sát chung",
    description: "Ghi nhận ý kiến chung để MEVI hỗ trợ bà con rõ ràng hơn.",
    icon: BookText,
    accent: "var(--mevi-green-700)",
    softAccent: "rgba(16, 185, 129, 0.12)",
  },
  {
    id: 397,
    key: "farm",
    name: "MEVI FARM",
    description: "Phù hợp với nhu cầu canh tác, theo dõi mùa vụ và nông trại.",
    icon: Sprout,
    accent: "#15803d",
    softAccent: "rgba(34, 197, 94, 0.12)",
  },
  {
    id: 398,
    key: "factory",
    name: "MEVI FACTORY",
    description:
      "Phù hợp với quy trình sơ chế, chế biến và kiểm soát chất lượng.",
    icon: Factory,
    accent: "#c2410c",
    softAccent: "rgba(249, 115, 22, 0.12)",
  },
  {
    id: 399,
    key: "shop",
    name: "MEVI SHOP",
    description:
      "Phù hợp với nhu cầu bán hàng, chăm sóc khách hàng và vận hành.",
    icon: ShoppingBag,
    accent: "#7c3aed",
    softAccent: "rgba(168, 85, 247, 0.12)",
  },
];

export const GENERAL_SURVEY_ID = 396;
export const INTRO_USER_QUESTION_ID = 8001;

export const introQuestions: SurveyQuestion[] = [
  {
    id: INTRO_USER_QUESTION_ID,
    code: "INTRO-USER",
    content: "Bạn muốn giải quyết vấn đề nào nhất khi tham gia App MEVI?",
    helperText:
      "Bạn có thể chọn nhiều mục phù hợp nhất với nhu cầu hiện tại của mình.",
    type: "multiple_choice",
    source: "demo",
    options: surveyTypes.map((survey) => ({
      id: survey.id,
      label: survey.name,
      description: survey.description,
    })),
  },
];

function createDemoQuestion(
  surveyPeriodId: number,
  index: number,
  question: Omit<SurveyQuestion, "id" | "source">,
): SurveyQuestion {
  return {
    ...question,
    id: surveyPeriodId * 100 + index + 1,
    source: "demo",
  };
}

export const demoSurveyDetails: Record<number, SurveyResultDetails> = {
  396: {
    id: 396,
    userCode: "MEVI-DEMO",
    userName: "Người dùng demo",
    positionName: "Khảo sát chung",
    departmentName: "MEVI",
    email: "mevi@gmail.com",
    surveyPeriodId: 396,
    surveyPeriodName: "Khảo sát chung",
    resultQuestions: [
      createDemoQuestion(396, 0, {
        code: "GEN-001",
        content: "Bạn đang quan tâm nhất đến trải nghiệm nào khi dùng MEVI?",
        helperText: "Đây là câu demo để test flow khảo sát chung.",
        type: "single_choice",
        required: true,
        options: [
          { id: 1, label: "Tìm thông tin nhanh" },
          { id: 2, label: "Theo dõi quy trình" },
          { id: 3, label: "Quản lý công việc" },
          { id: 4, label: "Kết nối kênh bán hàng" },
        ],
      }),
      createDemoQuestion(396, 1, {
        code: "GEN-002",
        content: "Bạn muốn MEVI hỗ trợ bạn tốt hơn ở điểm nào?",
        helperText: "Chọn nhiều ý phù hợp nhất với nhu cầu của bạn.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Giao diện dễ dùng" },
          { id: 2, label: "Nội dung ngắn gọn" },
          { id: 3, label: "Báo cáo rõ ràng" },
          { id: 4, label: "Có hướng dẫn chi tiết" },
        ],
      }),
      createDemoQuestion(396, 2, {
        code: "GEN-003",
        content: "Bạn có góp ý nào thêm cho khảo sát chung không?",
        helperText: "Đây là ô tự luận demo.",
        type: "essay",
        required: false,
      }),
    ],
  },
  397: {
    id: 397,
    userCode: "FARM-DEMO",
    userName: "Bà con demo Farm",
    positionName: "MEVI FARM",
    departmentName: "Nông trại",
    email: "mevi@gmail.com",
    surveyPeriodId: 397,
    surveyPeriodName: "MEVI FARM",
    resultQuestions: [
      createDemoQuestion(397, 0, {
        code: "FARM-001",
        content: "MEVI FARM giúp bạn ở khâu nào nhiều nhất?",
        helperText: "Câu demo cho phân hệ Farm.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Nhật ký sản xuất" },
          { id: 2, label: "Quản lý vật tư" },
          { id: 3, label: "Theo dõi mùa vụ" },
          { id: 4, label: "Truy xuất nguồn gốc" },
        ],
      }),
      createDemoQuestion(397, 1, {
        code: "FARM-002",
        content: "Mức độ dễ sử dụng của Farm hiện tại thế nào?",
        helperText: "Dữ liệu demo theo dạng rating.",
        type: "rating",
        required: true,
        options: [
          { id: 1, label: "1" },
          { id: 2, label: "2" },
          { id: 3, label: "3" },
          { id: 4, label: "4" },
          { id: 5, label: "5" },
        ],
        ratingMinLabel: "Khó dùng",
        ratingMaxLabel: "Rất dễ dùng",
      }),
      createDemoQuestion(397, 2, {
        code: "FARM-003",
        content: "Bạn muốn thêm tính năng nào cho Farm?",
        helperText: "Ô tự luận để test flow.",
        type: "essay",
        required: false,
      }),
    ],
  },
  398: {
    id: 398,
    userCode: "FACTORY-DEMO",
    userName: "Bà con demo Factory",
    positionName: "MEVI FACTORY",
    departmentName: "Nhà máy",
    email: "mevi@gmail.com",
    surveyPeriodId: 398,
    surveyPeriodName: "MEVI FACTORY",
    resultQuestions: [
      createDemoQuestion(398, 0, {
        code: "FAC-001",
        content: "Factory đang giúp bạn tối ưu phần nào?",
        helperText: "Chọn một đáp án demo.",
        type: "single_choice",
        required: true,
        options: [
          { id: 1, label: "Kiểm soát nguyên liệu" },
          { id: 2, label: "Quản lý sản xuất" },
          { id: 3, label: "Theo dõi chất lượng" },
          { id: 4, label: "Xuất kho thành phẩm" },
        ],
      }),
      createDemoQuestion(398, 1, {
        code: "FAC-002",
        content: "Bạn quan tâm nhóm tính năng nào của Factory?",
        helperText: "Chọn nhiều mục để test checkbox.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Quy trình sản xuất" },
          { id: 2, label: "Kiểm định chất lượng" },
          { id: 3, label: "Tối ưu công suất" },
          { id: 4, label: "Báo cáo tồn kho" },
        ],
      }),
      createDemoQuestion(398, 2, {
        code: "FAC-003",
        content: "Factory cần cải thiện gì trước tiên?",
        helperText: "Ô demo tự luận.",
        type: "essay",
        required: false,
      }),
    ],
  },
  399: {
    id: 399,
    userCode: "SHOP-DEMO",
    userName: "Bà con demo Shop",
    positionName: "MEVI SHOP",
    departmentName: "Bán hàng",
    email: "mevi@gmail.com",
    surveyPeriodId: 399,
    surveyPeriodName: "MEVI SHOP",
    resultQuestions: [
      createDemoQuestion(399, 0, {
        code: "SHOP-001",
        content: "Shop giúp bạn tốt nhất ở điểm nào?",
        helperText: "Câu demo cho phân hệ Shop.",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, label: "Đa kênh bán hàng" },
          { id: 2, label: "Quản lý đơn hàng" },
          { id: 3, label: "Chăm sóc khách hàng" },
          { id: 4, label: "Theo dõi doanh thu" },
        ],
      }),
      createDemoQuestion(399, 1, {
        code: "SHOP-002",
        content: "Mức độ sẵn sàng sử dụng Shop của bạn thế nào?",
        helperText: "Đây là dạng yes/no demo.",
        type: "yes_no",
        required: true,
        options: [
          { id: 1, label: "Có" },
          { id: 0, label: "Chưa" },
        ],
      }),
      createDemoQuestion(399, 2, {
        code: "SHOP-003",
        content: "Bạn mong muốn Shop thêm điều gì?",
        helperText: "Ô tự luận để kết thúc phần demo.",
        type: "essay",
        required: false,
      }),
    ],
  },
};

export const questionTypeMeta: Record<
  SurveyQuestionType,
  { label: string; icon: typeof MessageSquareQuote }
> = {
  essay: { label: "Tự luận", icon: MessageSquareQuote },
  single_choice: { label: "Chọn 1", icon: CircleDot },
  multiple_choice: { label: "Chọn nhiều", icon: SquareCheckBig },
  rating: { label: "Thang điểm", icon: SlidersHorizontal },
  yes_no: { label: "Có / Không", icon: CheckCircle2 },
  single_choice_matrix: { label: "Ma trận 1 chọn", icon: Table2 },
  multi_choice_matrix: { label: "Ma trận nhiều chọn", icon: Table2 },
  linear_matrix: { label: "Ma trận tuyến tính", icon: Table2 },
};
