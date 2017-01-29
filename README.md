# apartmentor

[![Greenkeeper badge](https://badges.greenkeeper.io/maxdavidson/apartmentor.svg)](https://greenkeeper.io/)

[![NPM](https://img.shields.io/npm/v/apartmentor.svg)](https://www.npmjs.com/package/apartmentor)
[![Build Status](https://img.shields.io/travis/maxdavidson/apartmentor/master.svg)](https://travis-ci.org/maxdavidson/apartmentor)
[![Coverage Status](https://img.shields.io/coveralls/maxdavidson/apartmentor/master.svg)](https://coveralls.io/github/maxdavidson/apartmentor?branch=master)
[![Dependency Status](https://img.shields.io/david/maxdavidson/apartmentor.svg)](https://david-dm.org/maxdavidson/apartmentor)
[![devDependency Status](https://img.shields.io/david/dev/maxdavidson/apartmentor.svg)](https://david-dm.org/maxdavidson/apartmentor?type=dev)

Search for apartments on Studentbostäder

## API

```typescript
export function search(): Promise<Apartment[]>;
export function searchContinuously(): Observable<Apartment[]>;

export interface Apartment {
  refid: string;
  typ: string;
  adress: string;
  antalVaningar: string;
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
  inflyttningDatumLabel: string;
  publiceratDatum: string;
}
```
