module.exports = {
  apps: [{
    name: 'summonyourwill',
    script: 'server.cjs',
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
