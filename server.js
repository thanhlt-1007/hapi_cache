'use strict';

const Hapi = require('hapi');
const CatboxRedis = require('catbox-redis');
var colors = require('colors');

const init = async () => {
  const server = Hapi.server({
    port: 8000,
    host: 'localhost',
    cache: [
      {
        name: 'redis_cache',
        provider: {
          constructor: CatboxRedis,
          options: {
            partition : 'HAPI_REDIS_PARTITION',
            host: '127.0.0.1',
            port: 6379,
            database: 0,
            password: 'Aa@123456'
          }
        }
      }
    ]
  });

  // server.method('sum', async (a, b) => {
  //     return a + b
  //   }, {
  //     cache: {
  //       cache: 'redis_cache',
  //       expiresIn: 10 * 1000,
  //       generateTimeout: 2000
  //     }
  //   }
  // );

  // server.route({
  //   method: 'GET',
  //   path: '/',
  //   handler: (request, h) => {
  //     return 'Hello World!';
  //   }
  // });

  // server.route({
  //   path: '/add/{a}/{b}',
  //   method: 'GET',
  //   handler: async function (request, h) {

  //     const { a, b } = request.params;
  //     return server.methods.sum(a, b);
  //   }
  // });

  // const SITEMAP_CACHE_EXPIRES_IN = 60 * 60 * 1000;
  const SITEMAP_CACHE_EXPIRES_IN = 10 * 60 * 1000;
  const SITEMAP_CACHE_STALE_TIMEOUT = 1 * 1000;

  function setSitemapCacheTTL(flags) {
    console.log('\n---setSitemapCacheTTL---'.red);

    console.log('\nflags'.yellow);
    console.log(flags);

    // every 1 hours from 00:00 to 23:00 (before new articles imported)
    const targetTime = moment().endOf('hour');
    flags.ttl = targetTime.diff(moment(), 'milliseconds');
  }

  function sitemapCacheStaleIn(stored, ttl) {
    console.log('\n---sitemapCacheStaleIn---'.red);

    console.log('\nstored'.yellow);
    console.log(stored);
    console.log('ttl'.yellow);
    console.log(ttl);

    var result = ttl - (30 * 1000); // before 30 seconds (milliseconds)

    console.log('\nreturn sitemapCacheStaleIn'.green);
    console.log(result);

    return result;
  }

  server.method('getSitemapXmlIndex', async (flags) => {
      return "sitemap";
    }, {
      cache: {
        cache: 'redis_cache',
        segment: 'sitemap_xml_index',
        expiresIn: SITEMAP_CACHE_EXPIRES_IN,
        staleIn: sitemapCacheStaleIn,
        staleTimeout: SITEMAP_CACHE_STALE_TIMEOUT,
        generateTimeout: false
      }
    }
  );

  server.route({
    path: '/sitemap',
    method: 'GET',
    handler: async function (request, h) {
      console.log(server.methods.getSitemapXmlIndex());
      return server.methods.getSitemapXmlIndex();
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
