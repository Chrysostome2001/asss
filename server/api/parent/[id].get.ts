export default defineEventHandler(async (event) => {
    const { id } = event.context.params!
    const backendURL = process.env.BACKEND_URL || 'http://localhost:8080'
  
    const auth = getHeader(event, 'authorization')
  
    return await $fetch(`${backendURL}/api/parent/${id}`, {
      headers: {
        Authorization: auth || '',
      },
    })
  })
  