export default defineEventHandler((event) => {
  console.log("✅ Nuxt endpoint works!");
  console.log("✅ Nuxt endpoint works!", event);
  return {
    success: true,
    message: "This is a Nuxt endpoint",
    timestamp: new Date().toISOString(),
  };
});
