import { normalizeGarage, normalizeSlot } from "./booking-flow";

export function createMockGarages(items = []) {
  return items.map((item) =>
    normalizeGarage({
      ...item,
      isMock: true,
    }),
  );
}

export function createMockSlots(garageId) {
  return [
    { id: 1, garageId, startTime: "08:00", endTime: "09:00", maxCapacity: 4, bookedCount: 1, status: "OPEN" },
    { id: 2, garageId, startTime: "09:30", endTime: "10:30", maxCapacity: 4, bookedCount: 4, status: "FULL" },
    { id: 3, garageId, startTime: "11:00", endTime: "12:00", maxCapacity: 3, bookedCount: 1, status: "OPEN" },
    { id: 4, garageId, startTime: "13:30", endTime: "14:30", maxCapacity: 4, bookedCount: 2, status: "OPEN" },
    { id: 5, garageId, startTime: "15:00", endTime: "16:00", maxCapacity: 4, bookedCount: 0, status: "OPEN" },
    { id: 6, garageId, startTime: "17:00", endTime: "18:00", maxCapacity: 2, bookedCount: 0, status: "CLOSED" },
  ].map((item) => normalizeSlot({ ...item, isMock: true }));
}
