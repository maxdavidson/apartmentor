import fetch from 'node-fetch';
import * as googl from 'goo.gl';
import { jsonp} from './utils';

export interface StudentbostaderResponse {
  data: {
    [widgetName: string]: any;
  }
}

export interface Apartment {
  refid: string;
  typ: string;
  adress: string;
  omrade: string;
  omradeKod: string;
  yta: number;
  hyra: string;
  hyraEnhet: string;
  poang: string;
  egenskaper: {
    id: string;
    beskrivning: string;
  }[];
  bild: {
    url: string;
    text: string;
  };
  bilder: {
    url: string;
    text: string;
  }[];
  vaning: string;
  detaljUrl: string;
  kortUrl?: string;
  fritext: string;
  inflyttningDatum: string;
  publiceratDatum: string;
}

const omraden = {
  fjarilen: '90K',
  flamman: '90A-F',
  irrblosset: '96',
  lambohov: '94',
  ryd: '92',
  t1: '95',
};

const egenskaper = {
  moblerad: '1015',
  omoblerad: '1016',
  bostadDirekt: 'SNABB',
};

const objektType = {

}

export interface SearchOptions {
  googleKey?: string;
}

export async function search({ googleKey }: SearchOptions = {}): Promise<Apartment[]> {
  const json = await jsonp('https://marknad.studentbostader.se/widgets/', {
    egenskaper: 'SNABB',
    'widgets[]': 'objektlista@lagenheter',
  }) as StudentbostaderResponse | null;

  // If this fails, the response interface has changed
  const apartments = json!.data['objektlista@lagenheter'] as Apartment[];

  if (googleKey && apartments.length > 0) {
    googl.setKey(googleKey);
    return await Promise.all(apartments.map(async (apartment) => {
      const kortUrl = await googl.shorten(apartment.detaljUrl);
      return Object.assign({}, apartment, { kortUrl });
    }));
  }

  return apartments;
}
