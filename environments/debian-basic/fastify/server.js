import fastify from "fastify";
import mysql from 'mysql2';

const server = fastify();

// Connexion à la base de données

// Fonction de tentative de connexion avec délai
const createConnectionWithRetry = () => {
    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection({
        host: 'mysql',
        user: 'test_user',
        password: 'password',
        database: 'load_test',
        port: 3306
      });
  
      // Essayer de se connecter, si échec, réessayer après un délai
      connection.connect(err => {
        if (err) {
          console.log("Erreur de connexion, réessayer dans 5 secondes...");
          setTimeout(() => {
            createConnectionWithRetry().then(resolve).catch(reject);
          }, 5000); // Attendre 5 secondes avant de réessayer
        } else {
          console.log('Connexion MySQL réussie');
          resolve(connection);
        }
      });
    });
  };
  
  // Connexion MySQL avec tentative de reconnexion

// Connexion MySQL avec tentative de reconnexion
createConnectionWithRetry().then(connection => {
    server.get('/db-test', async (request, reply) => {
      connection.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
          reply.status(500).send('Erreur dans la requête MySQL');
        } else {
          reply.send(results);
        }
      });
    });
  
    server.get('/', async (request, reply) => {
      return { hello: 'world' };
    });
  
    // Démarrer le serveur
    const start = async () => {
      try {
        await server.listen({port:3000, host:'0.0.0.0'});
        console.log('Server started at http://localhost:3000');
      } catch (err) {
        server.log.error(err);
        process.exit(1);
      }
    };
  
    start();
  }).catch(err => {
    console.error("Impossible de se connecter à MySQL après plusieurs tentatives :", err);
    process.exit(1);
  });
