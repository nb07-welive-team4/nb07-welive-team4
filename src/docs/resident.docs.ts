const residentResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "uuid-v4-string" },
    building: { type: "string", example: "101" },
    unitNumber: { type: "string", example: "101" },
    name: { type: "string", example: "김주민" },
    contact: { type: "string", example: "01011112222" },
    isHouseholder: { type: "string", enum: ["HOUSEHOLDER", "MEMBER"], example: "MEMBER" },
    apartmentId: { type: "string", example: "uuid-v4-apt" },
  },
};

const residentMessageSchema = {
  type: "object",
  properties: { message: { type: "string", example: "정상적으로 등록 처리되었습니다" } },
};

export const residentDocs = {
  "/api/residents": {
    get: {
      tags: ["Residents"],
      summary: "[관리자] 입주민 목록 조회",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "string" } },
        { name: "limit", in: "query", schema: { type: "string" } },
        { name: "building", in: "query", schema: { type: "string" } },
        { name: "unitNumber", in: "query", schema: { type: "string" } },
        { name: "keyword", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "입주민 목록 반환",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  residents: { type: "array", items: residentResponseSchema },
                  totalCount: { type: "number", example: 10 },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Residents"],
      summary: "[관리자] 수동으로 입주민 등록",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                building: { type: "string" },
                unitNumber: { type: "string" },
                contact: { type: "string" },
                name: { type: "string" },
                isHouseholder: { type: "string", enum: ["HOUSEHOLDER", "MEMBER"] },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "입주민 등록 성공",
          content: { "application/json": { schema: residentResponseSchema } },
        },
      },
    },
  },
  "/api/residents/from-users/{userId}": {
    post: {
      tags: ["Residents"],
      summary: "[관리자] 가입한 유저를 입주민 명부에 승인 등록",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        201: {
          description: "유저 기반 입주민 등록 완료",
          content: { "application/json": { schema: residentResponseSchema } },
        },
      },
    },
  },
  "/api/residents/from-file": {
    post: {
      tags: ["Residents"],
      summary: "[관리자] CSV 입주민 일괄 등록",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary", description: "입주민 명부 CSV" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "일괄 등록 성공",
          content: { "application/json": { schema: residentMessageSchema } },
        },
      },
    },
  },
  "/api/residents/file/template": {
    get: {
      tags: ["Residents"],
      summary: "[관리자] 입주민 등록 CSV 템플릿 다운로드",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "CSV 파일 반환",
          content: { "text/csv": { schema: { type: "string", format: "binary" } } },
        },
      },
    },
  },
  "/api/residents/file": {
    get: {
      tags: ["Residents"],
      summary: "[관리자] 입주민 목록 CSV 다운로드",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "CSV 파일 반환",
          content: { "text/csv": { schema: { type: "string", format: "binary" } } },
        },
      },
    },
  },
  "/api/residents/{residentId}": {
    get: {
      tags: ["Residents"],
      summary: "[관리자] 입주민 상세 조회",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "residentId", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: {
          description: "상세 조회 성공",
          content: { "application/json": { schema: residentResponseSchema } },
        },
      },
    },
    patch: {
      tags: ["Residents"],
      summary: "[관리자] 입주민 정보 수정",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "residentId", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: { type: "object", properties: { name: { type: "string" }, building: { type: "string" } } },
          },
        },
      },
      responses: {
        200: {
          description: "수정 성공",
          content: { "application/json": { schema: residentResponseSchema } },
        },
      },
    },
    delete: {
      tags: ["Residents"],
      summary: "[관리자] 입주민 계정 삭제 (퇴거)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "residentId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 204: { description: "삭제 성공" } },
    },
  },
};
