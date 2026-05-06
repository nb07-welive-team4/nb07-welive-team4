export interface CreateNoticeBody {
  category: string;
  title: string;
  content: string;
  boardId: string;
  isPinned: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateNoticeBody {
  category?: string;
  title?: string;
  content?: string;
  boardId?: string;
  isPinned?: boolean;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface NoticeListItem {
  noticeId: string;
  userId: string;
  category: string;
  title: string;
  writerName: string;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  commentsCount: number;
  isPinned: boolean;
}

export interface NoticeListResponse {
  notices: NoticeListItem[];
  totalCount: number;
}

export interface NoticeComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  writerName: string;
}

export interface NoticeDetail {
  noticeId: string;
  userId: string;
  category: string;
  title: string;
  writerName: string;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  commentsCount: number;
  isPinned: boolean;
  content: string;
  boardName: string;
  startDate?: Date | null;
  endDate?: Date | null;
  comments: NoticeComment[];
}

export interface NoticeListQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}