export default defineEventHandler(async (event) => {
    const body = await readBody(event)
  
    return {
      token: 'fake-token',
      user: { role: body.role }
    }
  })
  