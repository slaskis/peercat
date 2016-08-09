const {docopt} = require('docopt')
const PeerNetwork = require('peer-network')
const network = new PeerNetwork()

const usage = `
Usage:
  peercat listen [-qv] <name>
  peercat connect [-qv] <name>

Options:
  -q --quiet       Print less
  -v --verbose     Print more
`
const options = docopt(usage, {version: require('./package.json').version})

const name = options['<name>']
const verbose = options['--verbose'] || options['-v']
const quiet = options['--quiet'] || options['-q']

if (options.listen && name) {
  const server = network.createServer()
  server.on('connection', stream => {
    const id = (Date.now() + Math.random() * 1000 | 0).toString(16).slice(-8)
    verbose && console.error(`connected ${id}`)
    stream.pipe(process.stdout)
    stream.on('close', () => verbose && console.error(`disconnected ${id}`))
  })
  server.on('listening', () => quiet || console.error(`listening at "${name}"`))
  server.on('error', error => console.error(error.message))
  server.listen(name)

} else if (options.connect && name) {
  const stream = network.connect(name)
  stream.on('connect', () => quiet || console.error(`connected to ${name}`))
  stream.on('error', error => console.error(error.message))
  stream.on('close', () => {
    verbose && console.error('disconnected')
    process.exit(0)
  })
  process.stdin.pipe(stream)

} else {
  console.error(usage)
  process.exit(1)
}
