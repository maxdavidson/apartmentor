export function search(options?: { googleKey?: string; }): Promise<Apartment[]>;

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
