export default defineEventHandler(async (event) => {
  console.log("Request path:", event.path);
  return { message: "Hello World" };
});
