export default defineEventHandler(async (event) => {
  // Например, логируем запрос
  console.log('Request path:', event.path)
  return { message: 'Hello World' }
})
