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
  reportedContentData(data) {
    return {
      reported_content_id: data._id.toString(),
      problem: data.problem,
      reportedAt: data.reportedAt.toISOString(),
      reported_by: data.user_id,
      content: data.content_id,
    }
  },
}
