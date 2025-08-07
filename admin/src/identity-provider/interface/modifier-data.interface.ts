export interface ModifierData {
  $set: {
    [key: string]: string;
  };
  $unset?: {
    [key: string]: string;
  };
  [key: string]: string | object;
}
