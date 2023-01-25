export type PartialMock<T> = Partial<Record<keyof T, jest.Mock>>;
