import { useSelector } from "react-redux";
import { RootState } from "../redux-store";
import {
  DocumentStatusSelectListType,
  DocumentTypeSelectListType,
} from "@/types/apps/selectListTypes";
import moment from "moment";
type JwtData = {
  token: string;
};

export function getJwtToken(): string | null {
  const jwt = localStorage.getItem("jwt");

  if (jwt) {
    try {
      const parsedJwt: JwtData = JSON.parse(jwt);
      return parsedJwt.token;
    } catch (error) {
      console.error("Failed to parse JWT from localStorage:", error);
      return null;
    }
  }

  return null;
}

export function PermissionCheck(obj: string, act: string): Boolean {
  const { abilities } = useSelector((state: RootState) => state.ability);

  const find = abilities.find(
    (row: any) => row.rule_policy === obj && row.action[act] === true
  );

  return Boolean(find);
}
export function indonesiaFormattedDate(inputDate: string, isTime?: boolean) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const date = new Date(inputDate);
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  // Format time if isTime is true
  let formattedTime = "";
  if (isTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    formattedTime = ` ${hours}:${minutes}`;
  }

  return `${day} ${monthName} ${year}${formattedTime}`;
}

export function formattedFileName(fileName: string) {
  return fileName.split("/").at(-1);
}

export async function fetchSelectListDocumentType(documentCategoryId?: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = token;
  }

  let apiUrl = `/api/master/document-type?document_category_id=`;

  if (documentCategoryId)
    apiUrl = `/api/master/document-type?document_category_id=${documentCategoryId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master document type");
  }

  const responseData = await response.json();

  return responseData;
}

export const transformTypeDocuments = (
  data: any
): DocumentTypeSelectListType[] => {
  return data.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    prefix: doc.prefix,
  }));
};

export const getSelectListDocumentType = async (
  documentCategoryId: string
): Promise<DocumentTypeSelectListType[]> => {
  try {
    // Assuming fetchSelectListDocumentType is the function that makes the API request
    const response = await fetchSelectListDocumentType(documentCategoryId);
    let formattedData = transformTypeDocuments(response.data.data.data);
    return formattedData;
  } catch (error) {
    console.error("Error fetching document categories:", error);
    return []; // Return an empty array in case of an error
  }
};

export async function fetchSelectListDocumentStatus() {
  const token = getJwtToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/master/document-status`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master document status");
  }

  const responseData = await response.json();

  return responseData;
}

export const transformStatusDocuments = (
  data: any
): DocumentStatusSelectListType[] => {
  return data.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
  }));
};

export const getSelectListDocumentStatus = async (): Promise<
  DocumentStatusSelectListType[]
> => {
  try {
    // Assuming fetchSelectListDocumentType is the function that makes the API request
    const response = await fetchSelectListDocumentStatus();
    let formattedData = transformTypeDocuments(response.data.data.data);
    return formattedData;
  } catch (error) {
    console.error("Error fetching document status:", error);
    return []; // Return an empty array in case of an error
  }
};

export function formatReadableDate(isoDate: string) {
  // Parse the ISO 8601 date string
  const parsedDate = moment(isoDate);

  // Check if the date is valid
  if (!parsedDate.isValid()) {
    return "Invalid date";
  }

  // Format the date into a more readable format
  return parsedDate.format("D/M/Y H:M:S");
}

export const convertDate = (date: Date | null | undefined) => {
  // Original Date
  const originalDate = new Date(date!);

  // Convert to ISO 8601 UTC Format: "0001-01-01T00:00:00Z"
  const formattedDate = moment(originalDate)
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss");

  // Force it to a default value like "0001-01-01T00:00:00Z" if needed
  const finalDate = originalDate ? formattedDate : "0001-01-01T00:00:00";
  return finalDate;
};
export const convertTime = (date: Date | null | undefined) => {
  // Original Date
  const originalDate = new Date(date!);

  const timeOnly = moment(originalDate).format("HH:mm");
  return timeOnly;
};
