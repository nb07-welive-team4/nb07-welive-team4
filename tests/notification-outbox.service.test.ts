import { jest } from "@jest/globals";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockClaimBatch = jest.fn<(...args: any[]) => any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockMarkProcessed = jest.fn<(...args: any[]) => any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockMarkFailed = jest.fn<(...args: any[]) => any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindNotificationById = jest.fn<(...args: any[]) => any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdateDeliveryStatus = jest.fn<(...args: any[]) => any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPublish = jest.fn<(...args: any[]) => any>();

jest.unstable_mockModule("../src/repositories/notification.repository", () => ({
  claimPendingOutboxesForProcessing: mockClaimBatch,
  findPendingNotificationOutboxes: jest.fn(),
  claimNotificationOutboxForProcessing: jest.fn(),
  markNotificationOutboxProcessing: jest.fn(),
  markNotificationOutboxProcessed: mockMarkProcessed,
  markNotificationOutboxFailed: mockMarkFailed,
  findNotificationById: mockFindNotificationById,
  updateNotificationDeliveryStatus: mockUpdateDeliveryStatus,
  createNotifiacationRecord: jest.fn(),
  findNotificationByDedupeKey: jest.fn(),
  findUnreadNotificationsByUserId: jest.fn(),
  markNotificationAsRead: jest.fn(),
}));

jest.unstable_mockModule("../src/services/notification-realtime.service", () => ({
  publishNotificationCreated: mockPublish,
  emitNotificationToLocalClient: jest.fn(),
  subscribeNotificationChannel: jest.fn(),
}));

jest.unstable_mockModule("../src/lib/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const { processPendingOutboxes } = await import("../src/services/notification.outbox.service");

const sampleOutbox = {
  id: "outbox-001",
  notificationId: "noti-001",
  userId: "user-001",
};

const sampleNotification = {
  notificationId: "noti-001",
  userId: "user-001",
  content: "공지가 등록되었습니다.",
  notificationType: "NOTICE_CREATED" as const,
  notifiedAt: new Date(),
  isChecked: false,
  dedupeKey: null,
  complaintId: null,
  noticeId: "notice-001",
  pollId: null,
};

describe("processPendingOutboxes", () => {
  beforeEach(() => {
    mockClaimBatch.mockReset();
    mockMarkProcessed.mockReset();
    mockMarkFailed.mockReset();
    mockFindNotificationById.mockReset();
    mockUpdateDeliveryStatus.mockReset();
    mockPublish.mockReset();

    mockMarkProcessed.mockResolvedValue(undefined);
    mockMarkFailed.mockResolvedValue(undefined);
    mockUpdateDeliveryStatus.mockResolvedValue(undefined);
    mockPublish.mockResolvedValue(undefined);
  });

  it("claim된 outbox가 없으면 아무 작업도 하지 않는다", async () => {
    mockClaimBatch.mockResolvedValue([]);

    await processPendingOutboxes();

    expect(mockPublish).not.toHaveBeenCalled();
    expect(mockMarkProcessed).not.toHaveBeenCalled();
  });

  it("claimPendingOutboxesForProcessing을 호출해 배치로 claim한다 (SKIP LOCKED)", async () => {
    mockClaimBatch.mockResolvedValue([sampleOutbox]);
    mockFindNotificationById.mockResolvedValue(sampleNotification);

    await processPendingOutboxes();

    expect(mockClaimBatch).toHaveBeenCalledWith(50);
  });

  it("성공 시 PROCESSED 처리 및 deliveryStatus SENT로 업데이트한다", async () => {
    mockClaimBatch.mockResolvedValue([sampleOutbox]);
    mockFindNotificationById.mockResolvedValue(sampleNotification);

    await processPendingOutboxes();

    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(mockMarkProcessed).toHaveBeenCalledWith("outbox-001");
    expect(mockUpdateDeliveryStatus).toHaveBeenCalledWith(
      "noti-001",
      "SENT",
      expect.objectContaining({ sentAt: expect.any(Date) }),
    );
  });

  it("notification 레코드를 찾을 수 없으면 FAILED 처리한다", async () => {
    mockClaimBatch.mockResolvedValue([sampleOutbox]);
    mockFindNotificationById.mockResolvedValue(null);

    await processPendingOutboxes();

    expect(mockMarkFailed).toHaveBeenCalledWith("outbox-001", "Notification record not found");
    expect(mockPublish).not.toHaveBeenCalled();
    expect(mockMarkProcessed).not.toHaveBeenCalled();
  });

  it("notificationId 또는 userId가 없으면 FAILED 처리한다", async () => {
    const nullOutbox = { id: "outbox-null", notificationId: null, userId: null };
    mockClaimBatch.mockResolvedValue([nullOutbox]);

    await processPendingOutboxes();

    expect(mockMarkFailed).toHaveBeenCalledWith("outbox-null", "Missing notificationId or userId");
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it("publish 실패 시 FAILED 처리 및 deliveryStatus FAILED로 업데이트한다", async () => {
    mockClaimBatch.mockResolvedValue([sampleOutbox]);
    mockFindNotificationById.mockResolvedValue(sampleNotification);
    mockPublish.mockRejectedValue(new Error("Redis connection error"));

    await processPendingOutboxes();

    expect(mockMarkFailed).toHaveBeenCalledWith("outbox-001", "Redis connection error");
    expect(mockUpdateDeliveryStatus).toHaveBeenCalledWith(
      "noti-001",
      "FAILED",
      expect.objectContaining({ failedAt: expect.any(Date), failedReason: "Redis connection error" }),
    );
    expect(mockMarkProcessed).not.toHaveBeenCalled();
  });

  it("한 항목 실패해도 다음 항목을 계속 처리한다 (비중단)", async () => {
    const outbox2 = { id: "outbox-002", notificationId: "noti-002", userId: "user-002" };
    const notification2 = { ...sampleNotification, notificationId: "noti-002" };

    mockClaimBatch.mockResolvedValue([sampleOutbox, outbox2]);
    mockFindNotificationById
      .mockResolvedValueOnce(sampleNotification)
      .mockResolvedValueOnce(notification2);
    mockPublish
      .mockRejectedValueOnce(new Error("first fail"))
      .mockResolvedValueOnce(undefined);

    await processPendingOutboxes();

    expect(mockMarkFailed).toHaveBeenCalledWith("outbox-001", "first fail");
    expect(mockMarkProcessed).toHaveBeenCalledWith("outbox-002");
  });

  it("SKIP LOCKED로 claim된 항목들만 처리한다 (다른 worker가 선점한 항목은 반환되지 않음)", async () => {
    // SKIP LOCKED는 DB 수준에서 이미 잠긴 행을 건너뛰므로
    // claimPendingOutboxesForProcessing 반환값에 해당 항목이 포함되지 않는다.
    // 서비스 레이어에서는 반환된 배열만 처리한다.
    mockClaimBatch.mockResolvedValue([sampleOutbox]); // outbox-002는 다른 worker가 선점
    mockFindNotificationById.mockResolvedValue(sampleNotification);

    await processPendingOutboxes();

    expect(mockMarkProcessed).toHaveBeenCalledTimes(1);
    expect(mockMarkProcessed).toHaveBeenCalledWith("outbox-001");
  });
});
