
import { getWithCookies } from "./http";

interface DepartmentSearchItem {
  departmentId?: number;
  id?: number;
  college: string;
  name: string;
}

export interface DepartmentOption {
  id: number;
  college: string;
  name: string;
}

function buildDepartmentSearchPath(name: string) {
  const searchParams = new URLSearchParams();
  const trimmedName = name.trim();

  if (trimmedName) {
    searchParams.set("name", trimmedName);
  }

  const queryString = searchParams.toString();

  return queryString ? `/api/v1/departments?${queryString}` : "/api/v1/departments";
}

export async function searchDepartmentNames(name: string) {
  const response = await getWithCookies<DepartmentSearchItem[]>(buildDepartmentSearchPath(name));

  const departmentMap = new Map<number, DepartmentOption>();

  response.data.forEach((department) => {
    const departmentId = department.departmentId ?? department.id;
    const departmentName = department.name.trim();

    if (!departmentId || !departmentName || departmentMap.has(departmentId)) {
      return;
    }

    departmentMap.set(departmentId, {
      id: departmentId,
      college: department.college.trim(),
      name: departmentName,
    });
  });

  return Array.from(departmentMap.values());
}
