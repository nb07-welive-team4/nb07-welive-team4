export interface EventResponse {
  id: string;
  start: string;
  end: string;
  title: string;
  category: string;
  type: string;
}

export interface GetEventsQuery {
  apartmentId: string;
  year: number;
  month: number;
}

export interface UpsertEventQuery {
  boardType: "NOTICE" | "POLL";
  boardId: string;
  startDate: string;
  endDate: string;
}