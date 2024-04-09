const express = require('express');
const axios = require('axios');
const prometheus = require('prom-client');

const app = express();
const port = 3001;

// Configuration de Prometheus
prometheus.collectDefaultMetrics();

// Liste des services à surveiller
const services = [
  { name: 'Service1', url: 'https://dangngochalan.com/' },
  { name: 'Service2', url: 'https://www.google.com/' },
  // Ajoutez d'autres services selon vos besoins
];

// Endpoint pour exposer les métriques Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheus.register.contentType);
    const metrics = await prometheus.register.metrics();
    res.send(metrics);
  } catch (error) {
    console.error(`Error while getting metrics: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
});

// Fonction pour vérifier le statut et le temps de réponse des services
const checkServices = async () => {
  for (const service of services) {
    try {
      const startTime = Date.now();
      await axios.get(service.url);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Enregistrez les métriques Prometheus
      const labels = { service: service.name };
      const gauge = new prometheus.Gauge({ name: 'response_time', help: 'Response time for services', labelNames: Object.keys(labels) });
      gauge.set(labels, responseTime);

      console.log(`Service: ${service.name}, Response Time: ${responseTime}ms`);
    } catch (error) {
      console.error(`Service: ${service.name}, Error: ${error.message}`);
    }
  }
};

// Planifiez la vérification des services à intervalles réguliers (par exemple, toutes les 5 minutes)
setInterval(checkServices, 5 * 60 * 1000);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
