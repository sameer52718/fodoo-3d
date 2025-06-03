import { notFound } from "next/navigation";

export default function handleServerError(error, redirect = true) {
  console.error("API Fetch Error:", error);

  if (error.response) {
    const { status, data } = error.response;

    if (status === 404 && redirect) {
      notFound();
    }

    return { success: false, error: data?.message || `Error: ${status}` };
  }

  return { success: false, error: "Network error or request timeout" };
}
