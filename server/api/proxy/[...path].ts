// server/api/proxy/[...path].ts
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, "path");
  const method = getMethod(event);
  const query = getQuery(event);
  const body = await readBody(event).catch(() => null);

  console.log("🔧 Proxy request received for path:", path);

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "API path is required",
    });
  }

  // ФОРМИРУЕМ ПРАВИЛЬНЫЙ URL ДЛЯ БЭКЕНДА
  const backendPath = `/${path.join("/")}`;
  const targetUrl = `https://varvarka-api.grandfs-develop.ru/api/v1${backendPath}`;

  console.log("🌐 Making request to BACKEND:", targetUrl);
  console.log("Method:", method);

  try {
    const response = await $fetch(targetUrl, {
      method,
      body: method !== "GET" && body ? body : undefined,
      params: method === "GET" ? query : undefined,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Backend request successful");
    return response;
  } catch (error: unknown) {
    console.error("❌ Backend request failed:", error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Backend request failed",
      data: error.data,
    });
  }
});
