import { Collapse } from 'antd';
import { DateTime } from 'luxon';
import React, { useCallback } from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

import TraceCard from '../card/card';
import { CardInterface } from '../card/card.interface';

type CardListProps = {
  items: CardInterface[];
};
const orderByDateAsc = (list: CardInterface[]): CardInterface[] => {
  const orderedList = list.sort((a, b) => {
    const key1 = new Date(a.data.date).getTime();
    const key2 = new Date(b.data.date).getTime();

    if (key1 > key2) {
      return -1;
    }
    if (key1 === key2) {
      return 0;
    }
    return 1;
  });

  return orderedList;
};

function TraceCardList({ items }: CardListProps): JSX.Element {
  const expandIconHandler = useCallback(({ isActive }) => {
    const IconComponent = isActive ? AiOutlineMinus : AiOutlinePlus;
    return (
      <IconComponent className="text-primary custom-inner-icon" size={32} />
    );
  }, []);

  return (
    <React.Fragment>
      <Collapse
        accordion={false}
        bordered={false}
        className="bg-transparent"
        expandIcon={expandIconHandler}
        expandIconPosition="right">
        {orderByDateAsc(items).map(({ data, type }, index) => {
          let lastDateMonth;
          let currentDateMonth;
          if (index > 0) {
            lastDateMonth = DateTime.fromJSDate(items[index - 1].data.date)
              .setLocale('fr')
              .toFormat('LLLL yyyy');

            currentDateMonth = DateTime.fromJSDate(data.date)
              .setLocale('fr')
              .toFormat('LLLL yyyy');
          } else {
            currentDateMonth = DateTime.fromJSDate(data.date)
              .setLocale('fr')
              .toFormat('LLLL yyyy');
          }
          return (
            <React.Fragment key={data.id}>
              {lastDateMonth !== currentDateMonth && (
                <h5 className="text-charcoal font-weight-bold mb-4 text-capitalize">
                  {currentDateMonth}
                </h5>
              )}
              <TraceCard data={data} index={index} type={type} />
            </React.Fragment>
          );
        })}
      </Collapse>
      <div className="d-flex justify-content-center mb-5">
        <button
          className="btn-primary btn-lg py-3 px-5 w-50 font-weight-bold h2"
          type="button">
          Afficher plus
        </button>
      </div>
    </React.Fragment>
  );
}

export default TraceCardList;
