export default req => (req && req.session ? req.session.user : null)
