export const userDocs = {
  "/api/users/me": {
    patch: {
      tags: ["Users"],
      summary: "내 프로필 (비밀번호 및 이미지) 수정",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary", description: "프로필 이미지" },
                currentPassword: { type: "string" },
                newPassword: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "프로필 수정 성공",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "프로필 정보가 변경되었습니다." },
                  imageUrl: {
                    type: "string",
                    example: "https://s3.ap-northeast-2.amazonaws.com/mock-bucket/profiles/mock.png",
                  },
                },
              },
            },
          },
        },
        400: { description: "잘못된 요청 또는 비밀번호 불일치" },
      },
    },
  },
  "/api/users/password": {
    patch: {
      tags: ["Users"],
      summary: "비밀번호 단독 변경",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                currentPassword: { type: "string" },
                newPassword: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "비밀번호 변경 성공",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "유저테스트님의 비밀번호가 변경되었습니다. 다시 로그인해주세요.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
