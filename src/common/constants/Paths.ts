import jetPaths from 'jet-paths';

const Paths = {
  _: '/api',
  Users: {
    _: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
  Funds: {
    _: '/funds',
    Supply: '/:symbol/supply',
  },
} as const;

export const JetPaths = jetPaths(Paths);
export default Paths;
