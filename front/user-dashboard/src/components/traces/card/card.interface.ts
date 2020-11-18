export interface CardInterfaceBase {
  type: string;
  data: {
    account?: string;
    id: string;
    date: Date;
    title?: string;
    list?: string[];
    localisation?: string;
    security?: string;
  };
}
// add an index key for params in cardList
export interface CardInterface extends CardInterfaceBase {
  index?: number;
}
