export default req => (req ? `${req.protocol}://${req.get('Host')}` : '')
