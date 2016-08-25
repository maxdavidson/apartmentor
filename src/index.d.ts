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
