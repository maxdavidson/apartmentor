const fetch = require('node-fetch');
const googl = require('goo.gl');
const querystring = require('querystring');
const yargs = require('yargs')
const { JSONStorage } = require('node-localstorage');
const cache = new JSONStorage('./.cache');

const { argv } = yargs
  .option({
    i: {
      alias: 'interval',
      describe: 'Interval in seconds between API calls',
      default: 60,
      type: 'number'
    }
  })
  .help('h')
  .alias('h', 'help');

const { i: INTERVAL } = argv;
const { GOOGLE_SERVER_KEY, IFTTT_KEY } = process.env;

if (GOOGLE_SERVER_KEY) {
  googl.setKey(GOOGLE_SERVER_KEY);
}

(function findApartments() {
  const query = querystring.stringify({
    actionId: '',
    omraden: '',
    egenskaper: 'SNABB',
    objektType: '',
    callback: '',
    'widgets[]': 'objektlista@lagenheter',
    _: 1471690077367
  });
  
  const url = `https://marknad.studentbostader.se/widgets/?${query}`;
  
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      const json = JSON.parse(text.slice(1, -2));
      const apartments = json.data['objektlista@lagenheter'];

      return apartments.filter(apartment => {
        if (cache.getItem(apartment.refid) === null) {
          cache.setItem(apartment.refid, apartment);
          return true;
        }
        return false;
      });
    })
    .then(newApartments => {
      if (GOOGLE_SERVER_KEY && newApartments.length > 0) {
        console.info('Kortar ner URLer...');
        return Promise.all(newApartments.map(apartment =>
          googl.shorten(apartment.detaljUrl).then(shortUrl => Object.assign({}, apartment, { shortUrl }))));
      }
      return newApartments;
    })
    .then(newApartments => {
      console.log(`${new Date(Date.now()).toLocaleString('se-SV')}: Hittade ${newApartments.length} st nya lediga lägenheter`);
      console.log();

      if (newApartments.length === 0) {
        return;
      }
      
      newApartments.forEach((apartment, i) => {
        const { refid, adress, hyra, hyraEnhet, typ, inflyttningDatum, publiceratDatum, detaljUrl, shortUrl, poang } = apartment;
        console.log(`ID: ${refid}`);
        console.log(`Typ: ${typ}`);
        console.log(`Poäng: ${poang}`);
        console.log(`Hyra: ${hyra} ${hyraEnhet}`);
        console.log(`Adress: ${adress}`);
        console.log(`Inflyttning: ${inflyttningDatum}`);
        console.log(`Publicerat: ${publiceratDatum}`);
        console.log(`Länk: ${detaljUrl}`);
        console.log(`Kort länk: ${shortUrl}`);
        console.log();
      });

      if (IFTTT_KEY) {
        console.info('Pushar till IFTTT...');
        const event = 'apartmentor';
        const url = `https://maker.ifttt.com/trigger/${event}/with/key/${IFTTT_KEY}`;
        
        return Promise.all(newApartments.map(apartment => {
          const { adress, hyra, hyraEnhet, yta, typ, inflyttningDatum, shortUrl, detaljUrl, poang } = apartment;
          const message = `Bostad direkt: ${typ} ${yta} m2. ${adress}. ${poang}. ${hyra.replace(/\s+/g, '')} ${hyraEnhet}. ${inflyttningDatum}. ${shortUrl || detaljUrl}. 013-20 86 60.`;
          
          const payload = {
            value1: message,
            value2: adress,
            value3: shortUrl || detaljUrl
          };

          return fetch(url, {
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }));
      }
    })
    .catch(err => console.error(err))
    .then(() => setTimeout(findApartments, 1000 * INTERVAL));
})();
