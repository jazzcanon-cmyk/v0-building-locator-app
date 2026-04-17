// lib/buildingData.ts
import { Building } from "./building";

export const fetchBuildings = async (): Promise<Building[]> => {
  try {
    const response = await fetch("/api/buildings");
    if (!response.ok) throw new Error("네트워크 응답 없음");
    const data = await response.json();
    return data.buildings || [];
  } catch (error) {
    console.error("데이터를 가져오는데 실패했습니다:", error);
    return [];
  }
};

// 기존에 있던 export const buildings = [...] 이 부분은 지우셔도 됩니다.