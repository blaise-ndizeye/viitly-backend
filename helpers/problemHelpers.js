module.exports = {
  problemData(data) {
    return {
      problem_id: data._id.toString(),
      reporter: data.user_id,
      body: data.body,
      solved: data.solved,
      createdAt: data.createdAt.toISOString(),
    }
  },
}
