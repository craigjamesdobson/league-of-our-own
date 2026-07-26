export interface CuratedDevelopmentTeam {
  name: string;
  allowedTransfers: boolean;
  playerCodes: number[];
  transfer?: {
    outgoingPlayerCode: number;
    incomingPlayerCode: number;
    week: number;
  };
}

export const CURATED_DEVELOPMENT_TEAMS: CuratedDevelopmentTeam[] = [
  {
    name: 'High Press XI',
    allowedTransfers: true,
    playerCodes: [
      204936, // Donnarumma
      226597, // Gabriel
      247348, // Muñoz
      199796, // Cash
      494521, // Truffert
      141746, // Bruno Fernandes
      513418, // Schade
      243298, // Gakpo
      223094, // Haaland
      177815, // Calvert-Lewin
      538207, // Osula
    ],
    transfer: {
      outgoingPlayerCode: 513418, // Schade
      incomingPlayerCode: 201658, // Tavernier
      week: 6,
    },
  },
  {
    name: 'Counter Attack XI',
    allowedTransfers: true,
    playerCodes: [
      154561, // Raya
      209036, // Guéhi
      225796, // James
      244723, // Mitchell
      216051, // Dalot
      437730, // Semenyo
      223340, // Saka
      208706, // Bruno Guimarães
      502500, // Thiago
      178301, // Watkins
      475168, // João Pedro
    ],
    transfer: {
      outgoingPlayerCode: 208706, // Bruno Guimarães
      incomingPlayerCode: 215413, // Dewsbury-Hall
      week: 7,
    },
  },
  {
    name: 'Set Piece XI',
    allowedTransfers: false,
    playerCodes: [
      111234, // Pickford
      97032, // Virgil
      17761, // Tarkowski
      472769, // O'Reilly
      200834, // Mukiele
      204480, // Rice
      446008, // Mbeumo
      222531, // Gibbs-White
      224117, // Gyökeres
      231747, // Mateta
      444102, // Evanilson
    ],
  },
  {
    name: 'Possession XI',
    allowedTransfers: false,
    playerCodes: [
      457569, // Petrović
      467779, // Wieffer
      469142, // Van Hecke
      215136, // N. Williams
      466075, // Calafiori
      244851, // Palmer
      209244, // Foden
      448047, // Enzo
      50175, // Welbeck
      219168, // Isak
      438234, // Marmoush
    ],
  },
];
